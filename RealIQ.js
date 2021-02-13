/* global bootstrap */

const scoring = {
  acceptAll: undefined,
  saved: undefined,
  score: 0,
  checks: {},
  start: undefined, // datetime
  end: undefined
}

const $ = name => document.querySelector(name)
const toSeconds = ({ start, end }) => {
  const diff = end - start
  const sec = Math.floor(diff / 1000)
  return sec >= 1 ? sec : '<1'
}

const setupNavEvents = function () {
  const navlinks = document.querySelectorAll('.nav-link')
  navlinks.forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault()
      const tab = new bootstrap.Tab(e.currentTarget)
      tab.show()

      const target = e.currentTarget.getAttribute('data-target')
      const purposes = $('.modal-purposes')
      const vendors = $('.modal-vendors')

      if (target === 'purposes') {
        purposes.classList.add('d-block')
        purposes.classList.remove('d-none')
        vendors.classList.add('d-none')
        vendors.classList.remove('d-block')
      }

      if (target === 'vendors') {
        purposes.classList.add('d-none')
        purposes.classList.remove('d-block')
        vendors.classList.add('d-block')
        vendors.classList.remove('d-none')
      }
    })
  })
}

const setupFinishEvents = function () {
  const finishButtons = document.querySelectorAll('.finish-btn')
  finishButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      scoring.end = new Date()

      const scoringChecks = Object.entries(scoring.checks)
      const target = e.currentTarget.getAttribute('data-target')

      if (target === 'accept') {
        // game over
        scoring.acceptAll = true
        scoring.saved = false
      }

      if (target === 'save') {
        // better
        scoring.acceptAll = false
        scoring.saved = true
        scoring.score += 50

        scoringChecks.forEach(([id, check]) => {
          if (check) {
            scoring.score += id.includes('Vendor') ? 1 : 10
          }
        })
      }

      // insert score
      const scoreTarget = $('#score-target')
      scoreTarget.innerHTML = scoring.score.toString()

      if (scoring.score === 0) {
        const zeroScoreMessage = $('#zero-score-message')
        zeroScoreMessage.classList.add('d-block')
        zeroScoreMessage.classList.remove('d-none')
      } else {
        const zeroScoreMessage = $('#non-zero-score-message')
        zeroScoreMessage.classList.add('d-block')
        zeroScoreMessage.classList.remove('d-none')
      }

      // assign time-score - duration of managing the settings
      $('#time-target').innerHTML = toSeconds(scoring)

      // update list of consent in tracking
      const trackedList = $('#tracked-list')
      document.querySelectorAll('.consent-input').forEach(input => {
        const { id } = input
        if (!scoring.checks[id]) {
          const purpose = input.getAttribute('data-purpose')
          const li = `<li class="list-group-item">${purpose}</li>`
          trackedList.insertAdjacentHTML('beforeend', li)
        }
      })

      let vendorsCount = 0
      document.querySelectorAll('.vendor-consent').forEach(input => {
        const { id } = input

        if (!scoring.checks[id]) {
          vendorsCount++
        }
      })

      if (vendorsCount) {
        const li = `<li class="list-group-item">Share your data with ${vendorsCount} thrid-party vendors</li>`
        trackedList.insertAdjacentHTML('beforeend', li)
      }

      // make test-results block visible
      const resultsCard = $('#test-results')
      resultsCard.classList.add('d-block')
      resultsCard.classList.remove('d-none')

      // hide introduction block
      const introductionCard = $('#test-introduction')
      introductionCard.classList.add('d-none')
      introductionCard.classList.remove('d-block')

      testModal.hide()
    })
  })
}

const setupEvents = function () {
  setupNavEvents()
  setupVendorEvents()
  setupInputEvents()
  setupFinishEvents()
}

const setupInputEvents = function () {
  const allChecks = document.querySelectorAll('.consent-input')
  allChecks.forEach(el => {
    el.addEventListener('change', e => {
      const id = e.currentTarget.id
      scoring.checks[id] = !scoring.checks[id]
    })
  })
}

const setupVendorEvents = function () {
  const allVendors = document.querySelectorAll('.vendor-consent')
  const vendorSwitch = $('#toggleAllVendors')
  vendorSwitch.checked = true
  vendorSwitch.addEventListener('change', () => {
    allVendors.forEach(input => {
      input.click()
    })
  })

  allVendors.forEach(vendor => {
    vendor.addEventListener('change', e => {
      const id = e.currentTarget.id
      scoring.checks[id] = !scoring.checks[id]
    })
  })
}

const generateVendors = function () {
  const vendorNames = Array.from(new Set(`Dicta consequatur voluptatem ut. 
  Aliquid eum esse aut sint. Eius voluptas aut sint. Voluptas et laborum sit
  distinctio quia soluta eos nesciunt. Dolorem possimus reiciendis eum harum 
  nesciunt quaerat. Unde possimus et atque eveniet omnis quae eveniet aut.
  Porro similique non quibusdam hic quibusdam. Porro sit sunt accusantium. 
  Qui laudantium in quam qui perspiciatis aut voluptatibus. Ratione et commodi 
  ut quisquam qui ea perspiciatis et. Nulla expedita quia quia aut voluptatum 
  qui occaecati doloribus. Cum et blanditiis dolor temporibus. Esse nesciunt 
  exercitationem exercitationem rerum. Voluptatem animi et dolores. 
  Consequatur sunt consectetur voluptas dolorem velit. Necessitatibus ut quos 
  non temporibus fuga sed eaque natus. Suscipit impedit sint quos reiciendis 
  velit asperiores. Nihil odit ab a facere beatae sed voluptas. Officiis 
  consequuntur nostrum ut autem sit et. Accusamus aliquam voluptas voluptatum
  tempora consequuntur sapiente qui ab. Et voluptatem doloribus saepe hic 
  doloremque aperiam temporibus culpa. Omnis eos quo similique perspiciatis
  magni.
`.split(/\s+/g)))

  const companyTypes = ['Inc.', 'Ltd.', 'LLC', 'Copr.', 'Holding', 'AG', 'GmbH']
  const randomType = () => companyTypes[Math.floor(Math.random() * companyTypes.length)]
  const vendorList = $('#vendorList')

  vendorNames.forEach(name => {
    if (!name) return
    const companyName = name.charAt(0).toUpperCase() + name.slice(1)
    const li =
      `<li class="list-group-item d-flex justify-content-between">
        <span>${companyName} ${randomType()}</span>
        <span class="text-muted">
          <div class="form-check form-switch">
            <input class="form-check-input vendor-consent"
                type="checkbox"
                id="consentVendor-${companyName}" checked>
              <label class="form-check-label"
                for="consentDataAccess">Consent</label>
          </div>
       </li>`
    vendorList.insertAdjacentHTML('beforeend', li)
  })
}

let testModal

const showModal = function () {
  testModal = new bootstrap.Modal($('#testModal'), {
    keyboard: false,
    backdrop: 'static',
    focus: true
  })

  testModal.show()
  scoring.start = new Date()
}

const documentReady = function (callback) {
  if (document.readyState === 'complete') {
    return callback()
  } else {
    document.addEventListener('DOMContentLoaded', callback, false)
  }
}

documentReady(function () {
  // we give one second to wait to not raise any suspicion
  setTimeout(() => {
    generateVendors()
    setupEvents()
    showModal()
  }, 1000)
})
