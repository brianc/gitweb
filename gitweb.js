// ==UserScript==
// @name         Better Github Merges
// @namespace    https://webmerge.agardner.me/
// @version      0.1
// @description  Gives a rebase+squash button and a fast-forward merge button on Github PRs
// @author       Alan Gardner
// @match        https://github.com/*/*/pull/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var webmergeUrl = "https://webmerge.agardner.me/";

function getRepo() {
    var repoParts = window.location.pathname.split("/");
    return "github.com/"+repoParts[1]+"/"+repoParts[2]+".git";
}

function checkLoggedIn() {
    GM_xmlhttpRequest({
      method: "GET",
      url: webmergeUrl+"/auth/status",
      onload: function(result) {
        var response = JSON.parse(result.response);
        if (response.loggedIn) {
            addMergeButtons(response.user);   
        } else {
            addLoginButtons();
        }
      }});
}

function waitForStatus(jobId) {
    var mergeBox = $("#webmerge-message");
    var message = $("<div class=\"js-details-container\" id=\"webmerge-container\"></div>");
    var heading = $("<h3 class=\"merge-branch-heading\">Status - "+jobId+"</h3>");
    var output = $("<p></p>");
    mergeBox.empty();
    message.append(heading);
    message.append(output);
    mergeBox.append(message);
    interval = setInterval(function() {
      var url = webmergeUrl+"/job/status?job="+jobId;
      GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: function(result) {
          var response = JSON.parse(result.response);
          output.html(response.output.replace("\n","<br>"));
          if (response.isDone) {
              clearInterval(interval);
          }
        }});
    }, 1000);
}

function rebaseSquash() {
    var commits = $(".commit-ref:nth-child(3)");
    var branch = commits.text();
    var msg = $('#webmerge-commit').val();
    var repo = getRepo();
    var url = webmergeUrl+"/git/rebase";
    url += "?branch=" + encodeURIComponent(branch);
    url += "&msg=" + encodeURIComponent(msg);
    url += "&repo=" + encodeURIComponent(repo);
    var repo = getRepo();
    GM_xmlhttpRequest({
      method: "POST",
      url: url,
      onload: function(result) {
        var response = JSON.parse(result.response);
        waitForStatus(response.id);
      }});
}

function fastForwardMerge() {
    var commits = $(".commit-ref:nth-child(3)");
    var branch = commits.text();
    var url = webmergeUrl+"/git/merge";
    var repo = getRepo();
    url += "?branch=" + encodeURIComponent(branch);
    url += "&repo=" + encodeURIComponent(repo);
    GM_xmlhttpRequest({
      method: "POST",
      url: url,
      onload: function(result) {
        var response = JSON.parse(result.response);
        waitForStatus(response.id);
      }});
}

function addLoginButtons() {
    var box = $("<div id=\"webmerge-injected\" class=\"branch-action branch-action-state-clean js-mergable-state\"></div>");
    var body = $("<div class=\"branch-action-body\"></div>");
    var icon = $("<span class=\"mega-octicon octicon-git-merge branch-action-icon\"></span>");
    var message = $("<div class=\"merge-message\"></div>");
    var details = $("<div class=\"js-details-container\"><h3 class=\"merge-branch-heading\">Merge with WebMerge</h3><p class=\"merge-branch-description\"><a href=\""+webmergeUrl+"/auth/login\">Log in</a> to use WebMerge</p></div>");
    box.append(icon);
    box.append(body);
    message.append(details);
    body.append(message);
    $('#partial-pull-merging').append(box);
}

function addCommitMessage() {
    var commit = $(".js-issue-title:nth-child(1)").text();
    var mergeBox = $("#webmerge-message");
    var message = $("<div class=\"js-details-container\" id=\"webmerge-container\"></div>");
    var heading = $("<h3 class=\"merge-branch-heading\">Squash commit message</h3>");
    var commitMsg = $("<div><label>Commit message </label></div>");
    var msgInput = $("<input id=\"webmerge-commit\" style=\"margin-left: 20px; width: 200px;\"></input>");
    var squashBtn = $("<input type=\"button\" value=\"Squash + Rebase\" class=\"btn merge-branch-action js-details-target\">");
    mergeBox.empty();
    msgInput.val(commit);
    commitMsg.append(msgInput);
    message.append(squashBtn);
    message.append(heading);
    message.append(commitMsg);
    mergeBox.append(message);
    squashBtn.click(rebaseSquash);
}

function addMergeButtons(user) {
    var box = $("<div id=\"webmerge-injected\" class=\"branch-action branch-action-state-clean js-mergable-state\"></div>");
    var body = $("<div class=\"branch-action-body\"></div>");
    var icon = $("<span class=\"mega-octicon octicon-git-merge branch-action-icon\"></span>");
    var message = $("<div class=\"merge-message\" id=\"webmerge-message\"></div>");
    var details = $("<div class=\"js-details-container\" id=\"webmerge-box\"><h3 class=\"merge-branch-heading\">Merge with WebMerge</h3><p class=\"merge-branch-description\">Logged in as "+user+"</p></div>");
    var rebaseBtn = $("<input type=\"button\" value=\"Rebase + Squash\" class=\"btn merge-branch-action js-details-target\">");
    var mergeBtn = $("<input type=\"button\" value=\"Merge\" class=\"btn merge-branch-action js-details-target\">");
    rebaseBtn.click(addCommitMessage);
    mergeBtn.click(fastForwardMerge);
    message.append(rebaseBtn);
    message.append(mergeBtn);
    box.append(icon);
    box.append(body);
    message.append(details);
    body.append(message);
    $('#partial-pull-merging').append(box);
}

$(document).ready(checkLoggedIn);
