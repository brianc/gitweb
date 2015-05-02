package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
)

var GITHUB_CLIENT_ID = os.Getenv("GITHUB_CLIENT_ID")
var GITHUB_CLIENT_SECRET = os.Getenv("GITHUB_CLIENT_SECRET")

var (
	oauthConf = oauth2.Config{
		ClientID:     GITHUB_CLIENT_ID,
		ClientSecret: GITHUB_CLIENT_SECRET,
		Scopes:       []string{"user", "repo"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://github.com/login/oauth/authorize",
			TokenURL: "https://github.com/login/oauth/access_token",
		},
	}
	userOauthNonces = make(map[string]bool)
)

func authStart(w http.ResponseWriter, r *http.Request) {
	oauthToken := strconv.Itoa(int(rand.Int63()))
	authURL := oauthConf.AuthCodeURL(string(oauthToken), oauth2.AccessTypeOnline)
	fmt.Printf("AuthURL: %s\n", authURL)

	userOauthNonces[string(oauthToken)] = true
	fmt.Printf("oauth state: %s\n", string(oauthToken))

	http.Redirect(w, r, authURL, 307)
}

func authCallback(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	oauthState := r.FormValue("state")
	fmt.Printf("oauth state:" + oauthState)
	_, contains := userOauthNonces[oauthState]
	if !contains {
		http.Error(w, "Invalid OAuth secret", 500)
		return
	}
	delete(userOauthNonces, oauthState)
	tok, err := oauthConf.Exchange(oauth2.NoContext, r.FormValue("code"))
	if err != nil {
		resp, _ := json.Marshal(map[string]interface{}{"sucess": false, "error": err})
		w.Write(resp)
		return
	}

	fmt.Printf("Access token: %s", tok)

	authCookie := http.Cookie{
		Name:  "oauth",
		Value: tok.AccessToken,
		Path:  "/",
	}
	http.SetCookie(w, &authCookie)
	http.Redirect(w, r, "/", 307)
}

func getLoggedInUser(oauthState string) (*github.User, error) {
	resp, err := http.Get(fmt.Sprintf("https://api.github.com/user?access_token=%v", oauthState))
	if err != nil || resp.StatusCode != 200 {
		fmt.Printf("Status: %v", resp)
		return nil, fmt.Errorf("Unable to get logged in user")
	}
	user := github.User{}
	data := make([]byte, 4096)
	length, err := resp.Body.Read(data)
	if err != nil {
		fmt.Printf("Read error: %v\n", err)
		return nil, fmt.Errorf("Unable to get logged in user")
	}
	err = json.Unmarshal(data[:length], &user)
	if err != nil {
		fmt.Printf("Unmarshal error: %v\n", err)
		return nil, fmt.Errorf("Unable to get logged in user")
	}
	return &user, nil
}

func authStatus(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	fmt.Printf("Auth status")
	oauthState, err := r.Cookie("oauth")
	if err != nil {
		resp, _ := json.Marshal(map[string]interface{}{"loggedIn": false})
		w.Write(resp)
		return
	}
	user, err := getLoggedInUser(oauthState.Value)
	if err != nil {
		resp, _ := json.Marshal(map[string]interface{}{"loggedIn": false})
		w.Write(resp)
		return
	}
	fmt.Printf("Auth %v", user)
	resp, _ := json.Marshal(map[string]interface{}{"loggedIn": true, "user": user.Name})
	w.Write(resp)
}

func authLogout(w http.ResponseWriter, r *http.Request) {
	authCookie := http.Cookie{
		Name:    "oauth",
		Value:   "",
		Path:    "/",
		Expires: time.Unix(0, 0),
	}
	http.SetCookie(w, &authCookie)
	http.Redirect(w, r, "/", 307)
}
