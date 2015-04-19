package main

import (
  "bytes"
  "strings"
)

/* Rebase a branch against master, squash the commits and force push the result */
type GitRebase struct {
  config *GitConfig
  output bytes.Buffer
  err error
  isDone bool
  branch string
  message string
}


func NewGitRebase(branch, message string, config *GitConfig) *GitRebase{
  return &GitRebase {
    config: config,
    branch: branch,
    message: message,
  }
}

func (self *GitRebase) Finish(err error) {
  self.err = err
  self.isDone = true
}

func (self *GitRebase) Result() (string, bool, error) {
  return strings.Replace(self.output.String(), "\n", "<br>", -1), self.isDone, self.err
}

func (self *GitRebase) Run() error {
  err := self.config.CreateWorkingDir()
  if err != nil {
    return err
  }

  err = CloneRepo(self.config, &self.output)
  if err != nil {
    return err
  }

  err = CheckoutBranch(self.config, self.branch, &self.output)
  if err != nil {
    return err
  }

  err = SquashCommits(self.config, self.message, &self.output)
  if err != nil {
    return err
  }

  err = ForcePushBranch(self.config, self.branch, &self.output)
  if err != nil {
    return err
  }
  return nil
}


