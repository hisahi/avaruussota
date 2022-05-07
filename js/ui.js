const common = require('./common')

module.exports = (callbacks) => {
  let dialogOpacity = 0

  document.getElementById('scoreanimation').style.animation = 'none'
  document.getElementById('scoreanimation').style.visibility = 'hidden'
  document.getElementById('powerupanimation').style.animation = 'none'
  document.getElementById('powerupanimation').style.visibility = 'hidden'

  const updateZoomText = zoom => {
    document.getElementById('btnzoom').textContent = `zoom: ${(zoom * 100) | 0}%`
  }

  const showDialog = () => {
    dialogOpacity = 0
    document.getElementById('dialogbox').style.opacity = '0'
    document.getElementById('dialog').style.display = 'flex'
    document.getElementById('stats').style.display = 'none'
    document.getElementById('finalscore').style.display = 'block'
    document.body.style.position = 'absolute'
    document.body.style.overflow = ''
  }

  const hideDialog = () => {
    document.getElementById('dialog').style.display = 'none'
    document.getElementById('stats').style.display = 'block'
    document.body.style.position = 'relative'
    document.body.style.overflow = 'hidden'
  }

  const hideLose = () => {
    document.getElementById('defeat').style.display = 'none'
    document.getElementById('defeatcrash').style.display = 'none'
    document.getElementById('defeatplanet').style.display = 'none'
    document.getElementById('defeatname').style.display = 'none'
    document.getElementById('disconnected').style.display = 'none'
    document.getElementById('finalscore').style.display = 'none'
  }

  const disconnect = () => {
    hideLose()
    document.getElementById('disconnected').style.display = 'inline'
  }

  const updateOpacity = (delta) => {
    if (dialogOpacity < 1) {
      dialogOpacity = Math.min(1, dialogOpacity + delta / 250)
      document.getElementById('dialogbox').style.opacity = dialogOpacity
    }
  }

  const makeTd = (text) => {
    const td = document.createElement('td')
    td.textContent = text
    return td
  }
  
  const makeTableRow = (lb) => {
    const tr = document.createElement('tr')
    tr.appendChild(makeTd(lb[0]))
    tr.appendChild(makeTd(lb[1]))
    return tr
  }
  
  const updateLeaderboard = (leaderboard) => {
    const leaderBoardTable = document.getElementById('leaderboard')
    const newBody = document.createElement('tbody')
    
    for (let i = 0; i < Math.min(10, leaderboard.length); ++i) {
      newBody.appendChild(makeTableRow(leaderboard[i]))
    }
  
    leaderBoardTable.replaceChild(newBody, leaderBoardTable.childNodes[0])
  }
    
  const formatTime = (sec) => {
    sec = Math.floor(sec)
    return `${0 | (sec / 60)}:${('0' + (sec % 60)).slice(-2)}`
  }

  const updateControls = (state) => {
    if (state.dead) {
      document.getElementById('mobilecontrols').style.display = 'none'
    } else {
      document.getElementById('mobilecontrols').style.display = common.isMobile() ? 'block' : 'none'
    }
  }

  const updatePowerup = (self, state) => {
    let resText = ''
    if (!state.dead) {
      if (self.item !== null) {
        if (common.isMobile()) {
          resText += `item: ${self.item} ([USE] to use)\n`
        } else {
          resText += `item: ${self.item} ([Q] to use)\n`
        }
      }
      if (self.rubbership > 0) {
        resText += `[${formatTime(self.rubbership / 1000)}] rubber ship\n`
      }
      if (self.overdrive > 0) {
        resText += `[${formatTime(self.overdrive / 1000)}] overdrive\n`
      }
      if (self.regen > 0) {
        resText += `[${formatTime(self.regen / 1000)}] regen\n`
      }
    }
    document.getElementById('powerupstatus').textContent = resText.trim()
    document.getElementById('btnconsume').style.display = self.item !== null ? 'block' : 'none'
  }

  const updateOnlineStatus = (text) => {
    document.getElementById('onlinestatus').textContent = text
  }

  const updateColors = (health, time) => {
    if (health < 0.3) {
      document.getElementById('yourscore').style.color = (time % 1000) >= 500 ? '#f88' : '#fff'
      document.getElementById('healthbarhealth').style.background = ((time + 100) % 800) >= 400 ? '#800' : '#c00'
    } else if (health < 0.7) {
      const t = (health - 0.3) / 0.4 * 204
      document.getElementById('yourscore').style.color = '#fff'
      document.getElementById('healthbarhealth').style.background = `rgba(204,${t},${t})`
    } else {
      document.getElementById('yourscore').style.color = '#fff'
      document.getElementById('healthbarhealth').style.background = '#ccc'
    }
  }

  const updateScore = (scoreNow, scoreWas) => {
    document.getElementById('yourscore').textContent 
      = document.getElementById('scoreanimation').textContent 
      = document.getElementById('finalscorenum').textContent 
      = scoreNow
    if (scoreNow > scoreWas) {
      document.getElementById('scoreanimation').style.visibility = 'visible'
      document.getElementById('scoreanimation').style.animation = 'none'
      document.getElementById('scoreanimation').style.animation = ''
    }
  }

  const updatePlayerCount = (players) => {
    document.getElementById('playerCountNum').textContent = players
  }

  const updateHealthBar = (health) => {
    document.getElementById('healthbarhealth').style.width = `${Math.ceil(health * 200)}px`
  }

  const addDeathLog = (text) => {
    const deathLog = document.getElementById('deathlog')
    if (deathLog.childElementCount > 5)
      deathLog.removeChild(deathLog.firstChild)
    const p = document.createElement('p')
    p.textContent = text
    setTimeout(() => {
      if (p.parentNode) p.parentNode.removeChild(p)
    }, 5000)
    deathLog.appendChild(p)
  }

  const defeatedByPlayer = (name) => {
    hideLose()
    document.getElementById('defeat').style.display = 'inline'
    document.getElementById('defeatname').style.display = 'inline'
    document.getElementById('defeatname').innerHTML = name
  }

  const defeatedByCrash = (name) => {
    hideLose()
    document.getElementById('defeatcrash').style.display = 'inline'
    document.getElementById('defeatname').style.display = 'inline'
    document.getElementById('defeatname').innerHTML = name
  }

  const defeatedByPlanet = () => {
    hideLose()
    document.getElementById('defeatplanet').style.display = 'inline'
  }

  const showPowerupAnimation = () => {
    // document.getElementById('powerupanimation').style.visibility = 'visible'
    document.getElementById('powerupanimation').style.animation = 'none'
    document.getElementById('powerupanimation').style.animation = ''
  }

  const joiningGame = () => {
    document.getElementById('scoreanimation').style.animation = 'none'
    document.getElementById('scoreanimation').style.visibility = 'hidden'
    document.getElementById('powerupanimation').style.animation = 'none'
    document.getElementById('powerupanimation').style.visibility = 'hidden'
    document.getElementById('btnplay').blur()
    updateOnlineStatus('connecting')
  }

  document.getElementById('btnplay').addEventListener('click', (e) => {
    callbacks.tryLockMouse(e)
    callbacks.joinGame()
  })
  document.getElementById('btnfs').addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  })
  document.getElementById('btnzoom').addEventListener('click', () => {
    callbacks.nextZoom(1)
  })

  return {
    updateZoomText,
    updatePowerup,
    showDialog,
    hideDialog,
    hideLose,
    disconnect,
    updateControls,
    updateOpacity,
    updateLeaderboard,
    updateOnlineStatus,
    updateColors,
    updateScore,
    updatePlayerCount,
    updateHealthBar,
    showPowerupAnimation,
    defeatedByPlayer,
    defeatedByCrash,
    defeatedByPlanet,
    joiningGame,
    addDeathLog,
  }
}
