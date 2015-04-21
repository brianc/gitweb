package main

import (
  "fmt"
  "net/http"
  "encoding/json"
  "math/rand"
  "strconv"
  "sync"
)

var (
  userJobs = make(map[int]GitJob)
  workQueue = make(chan GitJob)
  outputMutex = sync.Mutex{}
  gitRoot = "/tmp/gitRepo"
)

func main() {
  fmt.Printf("Registering listeners\n")
  http.HandleFunc("/auth/login", authStart)
  http.HandleFunc("/auth/callback", authCallback)
  http.HandleFunc("/auth/status", authStatus)
  http.HandleFunc("/git/rebase", submitRebase)
  http.HandleFunc("/git/merge", submitMerge)
  http.HandleFunc("/job/status", getJobStatus)
  go jobRunner()
  err := http.ListenAndServe(":8080", nil)
  fmt.Printf("HTTP server error %v\n", err)
}

func jobRunner() {
  for {
    job := <-workQueue
    err := job.Run()
    job.Finish(err)
  }
}

func getJobStatus(w http.ResponseWriter, r *http.Request) {
  outputMutex.Lock()
  defer outputMutex.Unlock()
  job, err := strconv.Atoi(r.FormValue("job"))
  if err != nil {
    http.Error(w, "Invalid job ID", 403)
    return
  }
  jobStatus, ok := userJobs[job]
  if !ok {
    http.Error(w, "Invalid job ID", 403)
    return
  }
  output, isDone, err := jobStatus.Result()
  jobJson, _ := json.Marshal(map[string]interface{}{"output":output, "finished": isDone, "error": err})
  w.Write(jobJson)
}

func newJobConfig(r *http.Request) (*GitConfig, error) {
  authCookie, err := r.Cookie("oauth")
  if err != nil {
    return nil, err
  }
  user, err := getLoggedInUser(authCookie.Value)
  if err != nil {
    return nil, err
  }
  repo := r.FormValue("repo")
  return &GitConfig{oauthCreds: authCookie.Value, repoUrl: repo, email: *user.Email, user: *user.Name}, nil
}

func getNewJobId() int {
  jobId := int(rand.Int63())
  for {
    if _, ok := userJobs[jobId]; !ok {
      return jobId
    }
    jobId = int(rand.Int63())
  }
}

func submitRebase(w http.ResponseWriter, r *http.Request) {
  r.ParseForm()
  for k, v := range(r.Form) {
    fmt.Printf("%v: %v\n", k, v)
  }
  config, err := newJobConfig(r)
  if err != nil {
    http.Error(w, "No oauth cookie configured, please login", 403)
    return
  }
  branch := r.FormValue("branch")
  commitMsg := r.FormValue("msg")
  outputMutex.Lock()
  defer outputMutex.Unlock()
  jobId := getNewJobId()
  job := NewGitRebase(branch, commitMsg, config)
  userJobs[jobId] = job
  workQueue <- job
  jobJson, _ := json.Marshal(map[string]string{"id": strconv.Itoa(jobId)})
  fmt.Printf("JobID: %v %v\n", string(jobJson), jobId)
  w.Write(jobJson)
}


func submitMerge(w http.ResponseWriter, r *http.Request) {
  r.ParseForm()
  config, err := newJobConfig(r)
  if err != nil {
    http.Error(w, "No oauth cookie configured, please login", 403)
    return
  }
  branch := r.FormValue("branch")
  outputMutex.Lock()
  defer outputMutex.Unlock()
  jobId := getNewJobId()
  fmt.Printf("JobID: %v\n", jobId)
  job := NewGitMerge(branch, config)
  userJobs[jobId] = job
  workQueue <- job
  jobJson, _ := json.Marshal(map[string]string{"id": strconv.Itoa(jobId)})
  w.Write(jobJson)
}
