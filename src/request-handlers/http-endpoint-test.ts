import sessionService from '../services/session-service';

function httpEndpointTest(req, res, next) {
  const sessionId: string = req.params.sessionId;
  const session = sessionService.getSession(sessionId);
  if (session) {
    session.send(`responding to session ${sessionId}`);
  }
}

export default httpEndpointTest;