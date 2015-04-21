package main

import (
  "bytes"
  "os/exec"
  "fmt"
  "io/ioutil"
)

type GitJob interface {
  Run() error
  Finish(error)
  Result() (string, bool, error)
}

type GitConfig struct {
  oauthCreds string
  repoUrl string
  rootDir string
  tmpDir string
  user string
  email string
}

func (config *GitConfig) CreateWorkingDir() error {
  dir, err := ioutil.TempDir(config.tmpDir, "webmerge")
  config.rootDir = dir
  return err
}

func CloneRepo(config *GitConfig, output *bytes.Buffer) error {
  /* Clone into the repo */
  authRepoUrl := fmt.Sprintf("https://%v:@%v", config.oauthCreds, config.repoUrl)
  cloneCmd := exec.Command("git", "clone", authRepoUrl, config.rootDir)
  cloneOut, err := cloneCmd.CombinedOutput()
  output.Write(cloneOut)
  if err != nil {
    return err
  }

  fmt.Printf("Configuring user %v \n", config.user)

  userCmd := exec.Command("git", "config", "user.name", config.user)
  userCmd.Dir = config.rootDir
  userOut, err := userCmd.CombinedOutput()
  output.Write(userOut)
  if err != nil {
    return err
  }
  
  fmt.Printf("Configuring user %v \n", config.email)

  emailCmd := exec.Command("git", "config", "user.email", config.email)
  emailCmd.Dir = config.rootDir
  emailOut, err := emailCmd.CombinedOutput()
  output.Write(emailOut)
  return err
}

func CheckoutBranch(config *GitConfig, branch string, output *bytes.Buffer) error {
  /* Checkout the specified branch */
  checkoutCmd := exec.Command("git", "checkout", branch)
  checkoutCmd.Dir = config.rootDir
  checkoutOut, err := checkoutCmd.CombinedOutput()
  output.Write(checkoutOut)
  return err
}

func FFMergeBranch(config *GitConfig, branch string, output *bytes.Buffer) error {
  /* Fast-forward merge the specified branch into this one */
  mergeCmd := exec.Command("git", "merge", "--ff-only", "origin/" + branch)
  mergeCmd.Dir = config.rootDir
  mergeOut, err := mergeCmd.CombinedOutput()
  output.Write(mergeOut)
  return err
}

func RebaseBranch(config *GitConfig, branch string, output *bytes.Buffer) error {
  /* Rebase the current branch against the specified one */
  mergeCmd := exec.Command("git", "rebase", "master")
  mergeCmd.Dir = config.rootDir
  mergeOut, err := mergeCmd.CombinedOutput()
  output.Write(mergeOut)
  return err
}

func PushBranch(config *GitConfig, branch string, output *bytes.Buffer) error {
  /* Push the current branch to the specified one on origin (no force) */
  mergeCmd := exec.Command("git", "push", "origin", branch)
  mergeCmd.Dir = config.rootDir
  mergeOut, err := mergeCmd.CombinedOutput()
  output.Write(mergeOut)
  return err
}

func SquashCommits(config *GitConfig, message string, output *bytes.Buffer) error {
  squashCmd := exec.Command("git", "reset", "--soft", "origin/master")
  squashCmd.Dir = config.rootDir
  squashOutput, err := squashCmd.CombinedOutput()
  output.Write(squashOutput)
  if err != nil {
    return err
  }
  author := fmt.Sprintf("%v <%v>", config.user, config.email)
  commitCmd := exec.Command("git", "commit", "--author", author, "-am", message)
  commitCmd.Dir = config.rootDir
  commitOutput, err := commitCmd.CombinedOutput()
  output.Write(commitOutput)
  return err
}

func ForcePushBranch(config *GitConfig, branch string, output *bytes.Buffer) error {
  forcePushCmd := exec.Command("git", "push", "-f", "origin", branch)
  forcePushCmd.Dir = config.rootDir
  forcePushOutput, err := forcePushCmd.CombinedOutput()
  output.Write(forcePushOutput)
  return err
}
