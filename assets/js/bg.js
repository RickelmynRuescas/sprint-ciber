;(function () {
  'use strict'

  /* ─── CONFIG ─────────────────────────────────────── */
  const C = {
    parallax:   { maxX: 20, maxY: 13 },
    lerpFactor: 0.038,
    breathe:    { amp: 0.010, period: 19000 },
    particles: {
      count:     18,
      maxSpeed:  0.15,
      mouseR:    160,
      mousePull: 0.005
    }
  }

  /* ─── MOBILE ─────────────────────────────────────── */
  const mobile = window.matchMedia('(max-width: 768px)').matches

  /* ─── ELEMENTS ───────────────────────────────────── */
  const imgLayer  = document.getElementById('bgl-img')
  const canvas    = document.getElementById('bgl-canvas')
  const hudEl     = document.getElementById('bgl-hud')

  if (!imgLayer) return

  /* ─── CANVAS ─────────────────────────────────────── */
  const ctx = canvas && canvas.getContext('2d')

  function resize () {
    if (!canvas) return
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize, { passive: true })

  /* ─── HUD LINES — 2 lines, barely perceptible ────── */
  if (hudEl && !mobile) {
    ;[
      { left: '8%',  width: '48%', top: '24%', d: 28, dd:  0  },
      { left: '18%', width: '62%', top: '68%', d: 34, dd: -14 },
    ].forEach(h => {
      const el = document.createElement('div')
      el.className = 'bgl-hud-line'
      el.style.cssText = `left:${h.left};width:${h.width};top:${h.top};--d:${h.d}s;--dd:${h.dd}s`
      hudEl.appendChild(el)
    })
  }

  /* ─── PARTICLES — small, sparse, transparent ─────── */
  let pts = []

  function initPts () {
    pts = []
    if (mobile || !ctx) return
    for (let i = 0; i < C.particles.count; i++) {
      pts.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - .5) * C.particles.maxSpeed,
        vy: (Math.random() - .5) * C.particles.maxSpeed * .5 - .025,
        r:  Math.random() * .65 + .25,
        a:  Math.random() * .10 + .04,
        ph: Math.random() * Math.PI * 2,
        ps: .003 + Math.random() * .006
      })
    }
  }
  initPts()
  window.addEventListener('resize', initPts, { passive: true })

  /* ─── STATE ──────────────────────────────────────── */
  let mx = window.innerWidth  / 2
  let my = window.innerHeight / 2
  let tx = 0, ty = 0, cx = 0, cy = 0

  document.addEventListener('mousemove', e => {
    mx = e.clientX
    my = e.clientY
    tx = (e.clientX / window.innerWidth  - .5) * 2
    ty = (e.clientY / window.innerHeight - .5) * 2
  }, { passive: true })

  const lerp = (a, b, t) => a + (b - a) * t

  /* ─── MAIN LOOP ──────────────────────────────────── */
  function tick (t) {
    cx = lerp(cx, tx, C.lerpFactor)
    cy = lerp(cy, ty, C.lerpFactor)

    const breathe = 1 + Math.sin(t / C.breathe.period * Math.PI * 2) * C.breathe.amp
    imgLayer.style.transform =
      `translate3d(${cx * -C.parallax.maxX}px,${cy * -C.parallax.maxY}px,0) scale(${breathe.toFixed(5)})`

    if (ctx && pts.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]

        const dx = mx - p.x, dy = my - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < C.particles.mouseR) {
          const f = (1 - dist / C.particles.mouseR) * C.particles.mousePull
          p.vx += dx * f * .006
          p.vy += dy * f * .006
        }

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (spd > C.particles.maxSpeed * 2) {
          p.vx = p.vx / spd * C.particles.maxSpeed * 2
          p.vy = p.vy / spd * C.particles.maxSpeed * 2
        }

        p.x += p.vx; p.y += p.vy; p.ph += p.ps

        const w = canvas.width, h = canvas.height
        if (p.x < -4) p.x = w + 4; else if (p.x > w + 4) p.x = -4
        if (p.y < -4) p.y = h + 4; else if (p.y > h + 4) p.y = -4

        const alpha = p.a * (.55 + .45 * Math.sin(p.ph))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, 6.2832)
        ctx.fillStyle = `rgba(160,225,255,${alpha.toFixed(3)})`
        ctx.fill()
      }
    }

    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
})()
