import { h, render } from 'preact'
import { useState } from 'preact/hooks'
import { createDialogManager, Dialogs } from '../../components/dialogs'
import { lbryUrlCache } from '../../modules/yt/urlCache'
import { setExtensionSetting, targetPlatformSettings, useExtensionSettings } from '../../settings'

function WatchOnLbryPopup(params: {}) {
  const { redirect } = useExtensionSettings()
  let [loading, updateLoading] = useState(() => false)

  const dialogManager = createDialogManager()


  async function loads<T>(operation: Promise<T>) {
    try {
      updateLoading(true)
      await operation
    } catch (error) {
      console.error(error)
    }
    finally {
      updateLoading(false)
    }
  }

  return <div id='popup'>
    <Dialogs manager={dialogManager} />
    {
      <header>
        <section>
          <img id="logo" src={targetPlatformSettings.odysee.button.icon}></img>
          <label>Watch on Odysee</label>
        </section>
      </header>
    }
    {
      <main>
        <section>
          <label>Pick a mode:</label>
          <div className='options'>
            <a onClick={() => setExtensionSetting('redirect', true)} className={`button ${redirect ? 'active' : ''}`}>
              Redirect
            </a>
            <a onClick={() => setExtensionSetting('redirect', false)} className={`button ${redirect ? '' : 'active'}`}>
              Show a button
            </a>
          </div>
        </section>
        <section>
          <a onClick={() => loads(lbryUrlCache.clearAll().then(() => dialogManager.alert("Cleared Cache!")))} className={`button active`}>
            Clear Resolver Cache
          </a>
        </section>
        <section>
          <label>Tools</label>
          <a target='_blank' href='/pages/YTtoLBRY/index.html' className={`filled`}>
            Subscription Converter
          </a>
        </section>
      </main>
    }
    {loading && <div class="overlay">
      <span>Loading...</span>
    </div>}
  </div>
}

function renderPopup() {
  render(<WatchOnLbryPopup />, document.getElementById('root')!)
}

renderPopup()
