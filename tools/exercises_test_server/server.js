const http = require('http')
const { URL } = require('url')

function parseJson(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      if (!data) return resolve(null)
      try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

function makeOptionsForFeatures(features) {
  // Minimal deterministic exercise-option generator for tests
  const { age, gender, weight_kg, height_cm, activity_level, goal, experience_level } = features || {}

  const base = {
    duration_min: 30,
    calories_per_min: 7,
  }

  function mk(id, name, intensityMultiplier) {
    const intensity = Math.round((intensityMultiplier || 1) * 100)
    return {
      id,
      name,
      duration_min: base.duration_min,
      estimated_calories: Math.round(base.calories_per_min * base.duration_min * (intensityMultiplier || 1)),
      intensity_score: intensity,
      suitable_for: {
        activity_level: activity_level || 'moderate',
        experience_level: experience_level || 'intermediate',
      }
    }
  }

  // produce a small set: easy / standard / hard
  return [
    mk('easy_walk','Brisk Walking (Easy)', 0.7),
    mk('standard_run','Running (Standard)', 1.0),
    mk('hiit','HIIT (Hard)', 1.4)
  ]
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  if (req.method === 'GET' && url.pathname === '/api/exercises/options') {
    const catalog = [
      { id: 'easy_walk', name: 'Brisk Walking (Easy)' },
      { id: 'standard_run', name: 'Running (Standard)' },
      { id: 'hiit', name: 'HIIT (Hard)' }
    ]
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ catalog }))
  }

  if (req.method === 'POST' && url.pathname === '/api/exercises/options') {
    try {
      const body = await parseJson(req)
      const features = (body && body.features) ? body.features : body
      const options = makeOptionsForFeatures(features || {})
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ options }))
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'invalid json', details: err.message }))
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'not found' }))
})

const PORT = process.env.PORT || 15002
server.listen(PORT, () => {
  console.log(`Exercises test server listening on http://localhost:${PORT}`)
})

module.exports = server
