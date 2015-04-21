package main

import (
  "bytes"
)

/* Merge a branch into master, FF-only, and push the result */
type GitMerge struct {
  config *GitConfig
  output bytes.Buffer
  err error
  isDone bool
  branch string
}

func NewGitMerge(branch string, config *GitConfig) *GitMerge{
  return &GitMerge {
    config: config,
    branch: branch,
  }
}

func (self *GitMerge) Finish(err error) {
  self.err = err
  self.isDone = true
}

func (self *GitMerge) Result() (string, bool, error) {
  return strings.Replace(self.output.String(), "\n", "<br>", -1), self.isDone, self.err
}

func (self *GitMerge) Run() error {
  err := self.config.CreateWorkingDir()
  if err != nil {
    return err
  }

  err = CloneRepo(self.config, &self.output)
  if err != nil {
    return err
  }

  err = FFMergeBranch(self.config, self.branch, &self.output)
  if err != nil {
    return err
  }

  err = PushBranch(self.config, "master", &self.output)
  if err != nil {
    return err
  }
  return nil
}
