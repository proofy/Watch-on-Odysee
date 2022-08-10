import { h, render } from 'preact'
import { useState } from 'preact/hooks'
import { createDialogManager, Dialogs } from '../../components/dialogs'
import { lbryUrlCache } from '../../modules/yt/urlCache'
import { setExtensionSetting, targetPlatformSettings, useExtensionSettings } from '../../settings'

function WatchOnLbryPopup(params: {}) {
  const { redirectChannel, redirectVideo, redirectVideoPlaylist, buttonVideoSub, buttonChannelSub, buttonVideoPlayer } = useExtensionSettings()
  let [loading, updateLoading] = useState(() => false)
  let [route, updateRoute] = useState<string>(() => '')

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
        <img id="logo" src={targetPlatformSettings.odysee.button.icon}></img>
        <label>Watch on Odysee</label>
      </header>
    }
    {
      <main>
        <section>
          <label>Auto redirect when:</label>
          <div className='options'>
            <div class="toggle-option">
              <span>Playing a video</span>
              <a onClick={() => setExtensionSetting('redirectVideo', !redirectVideo)} className={`button ${redirectVideo ? 'active' : ''}`}>
                {redirectVideo ? 'Active' : 'Deactive'}
              </a>
            </div>
            <div class="toggle-option">
              <span>Playing a playlist</span>
              <a onClick={() => setExtensionSetting('redirectVideoPlaylist', !redirectVideoPlaylist)} className={`button ${redirectVideoPlaylist ? 'active' : ''}`}>
                {redirectVideoPlaylist ? 'Active' : 'Deactive'}
              </a>
            </div>
            <div class="toggle-option">
              <span>Viewing a channel</span>
              <a onClick={() => setExtensionSetting('redirectChannel', !redirectChannel)} className={`button ${redirectChannel ? 'active' : ''}`}>
                {redirectChannel ? 'Active' : 'Deactive'}
              </a>
            </div>
          </div>
        </section>
        <section>
          <label>Show redirect button on:</label>
          <div className='options'>
            <div className="toggle-option">
              <span>Video Page</span>
              <a onClick={() => setExtensionSetting('buttonVideoSub', !buttonVideoSub)} className={`button ${buttonVideoSub ? 'active' : ''}`}>
                {buttonVideoSub ? 'Active' : 'Deactive'}
              </a>
            </div>
            <div className="toggle-option">
              <span>Channel Page</span>
              <a onClick={() => setExtensionSetting('buttonChannelSub', !buttonChannelSub)} className={`button ${buttonChannelSub ? 'active' : ''}`}>
                {buttonChannelSub ? 'Active' : 'Deactive'}
              </a>
            </div>
            <div className="toggle-option">
              <span>Video Player</span>
              <a onClick={() => setExtensionSetting('buttonVideoPlayer', !buttonVideoPlayer)} className={`button ${buttonVideoPlayer ? 'active' : ''}`}>
                {buttonVideoPlayer ? 'Active' : 'Deactive'}
              </a>
            </div>
          </div>
        </section>
        <section>
          <label>Tools</label>
          <a target='_blank' href='/pages/YTtoLBRY/index.html' className={`filled`}>
            Subscription Converter
          </a>
          <a onClick={() => loads(lbryUrlCache.clearAll().then(() => dialogManager.alert("Cleared Cache!")))} className={`button active`}>
            Clear Resolver Cache
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
