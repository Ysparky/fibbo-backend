export enum WebSocketEvents {
  // Session events
  JOIN_SESSION = 'joinSession',
  LEAVE_SESSION = 'leaveSession',
  USER_JOINED = 'userJoined',
  USER_LEFT = 'userLeft',

  // Voting events
  START_VOTING = 'startVoting',
  SUBMIT_VOTE = 'submitVote',
  REVEAL_VOTES = 'revealVotes',
  END_VOTING = 'endVoting',
  VOTE_SUBMITTED = 'voteSubmitted',
  VOTES_REVEALED = 'votesRevealed',
  VOTING_STARTED = 'votingStarted',
  VOTING_ENDED = 'votingEnded',

  // Task events
  TASK_CREATED = 'taskCreated',
  TASK_UPDATED = 'taskUpdated',
  TASK_DELETED = 'taskDeleted',
  CURRENT_TASK_CHANGED = 'currentTaskChanged',

  // Error events
  ERROR = 'error',
}
