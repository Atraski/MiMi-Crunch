const healthCheck = (req, res) => {
  res.json({ status: 'ok' })
}

export { healthCheck }
