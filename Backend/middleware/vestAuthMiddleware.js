import vestauth from 'vestauth';

// Verify incoming HTTP requests signed by a Vest-authenticated agent.
// Usage: attach to routes that should accept requests from external agents.
const vestAuthMiddleware = async (req, res, next) => {
  try {
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const agent = await vestauth.tool.verify(req.method, url, req.headers);
    req.vestAgent = agent;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Agent verification failed',
      error: err?.message || String(err)
    });
  }
};

export default vestAuthMiddleware;
