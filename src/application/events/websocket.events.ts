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
  UPDATE_VOTE = 'updateVote',
  VOTE_UPDATED = 'voteUpdated',
  GET_USER_VOTES = 'getUserVotes',

  // Task events
  TASK_CREATED = 'taskCreated',
  TASK_UPDATED = 'taskUpdated',
  TASK_DELETED = 'taskDeleted',
  CURRENT_TASK_CHANGED = 'currentTaskChanged',

  // Error events
  ERROR = 'error',
}

export enum WsErrorCode {
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  VOTE_NOT_FOUND = 'VOTE_NOT_FOUND',
  INVALID_OPERATION = 'INVALID_OPERATION',
}
