import { h, render } from 'preact'
import { parseYouTubeURLTimeString } from '../modules/yt'
import type { resolveById, ResolveUrlTypes } from '../modules/yt/urlResolve'
import { getExtensionSettingsAsync, getSourcePlatfromSettingsFromHostname, getTargetPlatfromSettingsEntiries, SourcePlatform, sourcePlatfromSettings, TargetPlatform, targetPlatformSettings } from '../settings';

(async () => {
  const sleep = (t: number) => new Promise(resolve => setTimeout(resolve, t))

  interface Target {
    platform: TargetPlatform
    lbryPathname: string
    type: ResolveUrlTypes
    time: number | null
  }

  interface Source {
    platform: SourcePlatform
    id: string
    type: ResolveUrlTypes
    time: number | null
  }

  const targetPlatforms = getTargetPlatfromSettingsEntiries()
  const settings = await getExtensionSettingsAsync()
  // Listen Settings Change
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'local') return
    Object.assign(settings, Object.fromEntries(Object.entries(changes).map(([key, change]) => [key, change.newValue])))
    if (settings.redirect) updateButton(null)
  })

  const buttonMountPoint = document.createElement('div')
  buttonMountPoint.style.display = 'inline-flex'

  const playerButtonMountPoint = document.createElement('div')
  playerButtonMountPoint.style.display = 'inline-flex'

  function WatchOnLbryButton({ source, target }: { source?: Source, target?: Target }) {
    if (!target || !source) return null
    const url = getLbryUrlByTarget(target)

    return <div
      style={{
        display: 'grid',
        gridTemplateRows: '36px',
        gridAutoColumns: 'auto',
        alignContent: 'center'
      }}
    >
      <a href={`${url.href}`} target='_blank' role='button'
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          borderRadius: '2px',
          padding: '0 16px',
          margin: '0 4px',

          fontWeight: 'bold',
          border: '0',
          color: 'whitesmoke',
          fontSize: '14px',
          textDecoration: 'none',
          backgroundColor: target.platform.theme,
          backgroundImage: target.platform.theme,
          ...target.platform.button.style?.button,
        }}
        onClick={() => findVideoElementAwait(source).then((videoElement) => {
          videoElement.pause()
        })}
      >
        <img src={target.platform.button.icon} height={24} style={{ ...target.platform.button.style?.icon }} />
        <span>{target.type === 'channel' ? 'Channel on' : 'Watch on'} {target.platform.button.platformNameText}</span>
      </a>
    </div>
  }

  function WatchOnLbryPlayerButton({ source, target }: { source?: Source, target?: Target }) {
    if (!target || !source) return null
    const url = getLbryUrlByTarget(target)

    return <div
      style={{
        display: 'grid',
        gridTemplateRows: '36px',
        gridAutoColumns: 'auto',
        alignContent: 'center'
      }}
    >
      <a href={`${url.href}`} target='_blank' role='button'
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          borderRadius: '2px',
          paddingRight: '10px',

          fontWeight: 'bold',
          border: '0',
          color: 'whitesmoke',
          fontSize: '14px',
          textDecoration: 'none',
          ...target.platform.button.style?.button,
        }}
        onClick={() => findVideoElementAwait(source).then((videoElement) => {
          videoElement.pause()
        })}
      >
        <img src={target.platform.button.icon} height={24} style={{ ...target.platform.button.style?.icon }} />
        <span>{target.type === 'channel' ? 'Channel on' : 'Watch on'} {target.platform.button.platformNameText}</span>
      </a>
    </div>
  }

  function updateButton(params: { source: Source, target: Target } | null): void {
    if (!params) {
      render(<WatchOnLbryButton />, buttonMountPoint)
      render(<WatchOnLbryPlayerButton />, playerButtonMountPoint)
      return
    }

    {
      const mountPlayerButtonBefore = settings.videoPlayerButton ?
        document.querySelector(params.source.platform.htmlQueries.mountPoints.mountPlayerButtonBefore) :
        null
      if (!mountPlayerButtonBefore) render(<WatchOnLbryPlayerButton />, playerButtonMountPoint)
      else {
        if (playerButtonMountPoint.getAttribute('data-id') !== params.source.id) {
          mountPlayerButtonBefore.parentElement?.insertBefore(playerButtonMountPoint, mountPlayerButtonBefore)
          playerButtonMountPoint.setAttribute('data-id', params.source.id)
        }
        render(<WatchOnLbryPlayerButton target={params.target} source={params.source} />, playerButtonMountPoint)
      }
    }

    {
      const mountButtonBefore = settings[(`${params.source.type}SubButton`) as 'videoSubButton' | 'channelSubButton'] ?
        document.querySelector(params.source.platform.htmlQueries.mountPoints.mountButtonBefore[params.source.type]) :
        null
      if (!mountButtonBefore) render(<WatchOnLbryButton />, buttonMountPoint)
      else {
        if (buttonMountPoint.getAttribute('data-id') !== params.source.id) {
          mountButtonBefore.parentElement?.insertBefore(buttonMountPoint, mountButtonBefore)
          buttonMountPoint.setAttribute('data-id', params.source.id)
        }
        render(<WatchOnLbryButton target={params.target} source={params.source} />, buttonMountPoint)
      }
    }
  }

  async function findVideoElementAwait(source: Source) {
    let videoElement: HTMLVideoElement | null = null
    while (!(videoElement = document.querySelector(source.platform.htmlQueries.videoPlayer))) await sleep(200)
    return videoElement
  }

  async function getSourceByUrl(url: URL): Promise<Source | null> {
    const platform = getSourcePlatfromSettingsFromHostname(new URL(location.href).hostname)
    if (!platform) return null

    if (url.pathname === '/watch' && url.searchParams.has('v')) {
      return {
        id: url.searchParams.get('v')!,
        platform,
        time: url.searchParams.has('t') ? parseYouTubeURLTimeString(url.searchParams.get('t')!) : null,
        type: 'video'
      }
    }
    else if (url.pathname.startsWith('/channel/')) {
      return {
        id: url.pathname.substring("/channel/".length),
        platform,
        time: null,
        type: 'channel'
      }
    }
    else if (url.pathname.startsWith('/c/') || url.pathname.startsWith('/user/')) {
      // We have to download the page content again because these parts of the page are not responsive
      // yt front end sucks anyway
      const content = await (await fetch(location.href)).text()
      const prefix = `https://www.youtube.com/feeds/videos.xml?channel_id=`
      const suffix = `"`
      const startsAt = content.indexOf(prefix) + prefix.length
      const endsAt = content.indexOf(suffix, startsAt)
      const id = content.substring(startsAt, endsAt)
      return {
        id,
        platform,
        time: null,
        type: 'channel'
      }
    }

    return null
  }

  async function getTargetsBySources(...sources: Source[]) {
    const params: Parameters<typeof requestResolveById>[0] = sources.map((source) => ({ id: source.id, type: source.type }))
    const platform = targetPlatformSettings[settings.targetPlatform]

    const results = await requestResolveById(params) ?? []
    const targets: Record<string, Target | null> = Object.fromEntries(
      sources.map((source) => {
        const result = results[source.id]
        if (!result) return [
          source.id,
          null
        ]

        return [
          source.id,
          {
            type: result.type,
            lbryPathname: result.id,
            platform,
            time: source.time
          }
        ]
      })
    )

    return targets
  }
  // We should get this from background, so the caching works and we don't get errors in the future if yt decides to impliment CORS
  async function requestResolveById(...params: Parameters<typeof resolveById>): ReturnType<typeof resolveById> {
    const response = await new Promise<string | null | 'error'>((resolve) => chrome.runtime.sendMessage({ method: 'resolveUrl', data: JSON.stringify(params) }, resolve))
    if (response?.startsWith('error:')) {
      console.error("Background error on:", params)
      throw new Error(`Background error.${response ?? ''}`)
    }
    return response ? JSON.parse(response) : null
  }

  // Request new tab
  async function openNewTab(url: URL, active: boolean) {
    chrome.runtime.sendMessage({ method: 'openTab', data: JSON.stringify({ href: url.href, active }) })
  }

  function getLbryUrlByTarget(target: Target) {
    const url = new URL(`${target.platform.domainPrefix}${target.lbryPathname}`)
    if (target.time) url.searchParams.set('t', target.time.toFixed(0))

    return url
  }

  let urlHrefCache: string | null = null
  while (true) {
    await sleep(500)
    const url: URL = new URL(location.href)

    await (async () => {
      const source = await getSourceByUrl(new URL(location.href))
      if (!source) return

      try {
        if (settings.redirect) {
          const target = (await getTargetsBySources(source))[source.id]
          if (!target) return
          console.log(url.href, urlHrefCache)
          if (url.href === urlHrefCache) return

          const lbryURL = getLbryUrlByTarget(target)

          if (source.type === 'video') {
            // As soon as video play is ready and start playing, pause it.
            findVideoElementAwait(source).then((videoElement) => {
              videoElement.addEventListener('play', () => videoElement.pause(), { once: true })
              videoElement.pause()
            })
          }
          
          console.log('open', lbryURL.href)
          openNewTab(lbryURL, document.hasFocus())

          if (window.history.length === 1) window.close()
          else window.history.back()
        }
        else {
          if (urlHrefCache !== url.href) updateButton(null)
          let target = (await getTargetsBySources(source))[source.id]

          // There is no target found via API try to check Video Description for LBRY links.
          if (!target) {
            const linksContainer =
              source.type === 'video' ?
                document.querySelector(source.platform.htmlQueries.videoDescription) :
                source.platform.htmlQueries.channelLinks ? document.querySelector(source.platform.htmlQueries.channelLinks) : null

            if (linksContainer) {
              const anchors = Array.from(linksContainer.querySelectorAll<HTMLAnchorElement>('a'))

              for (const anchor of anchors) {
                if (!anchor.href) continue
                const url = new URL(anchor.href)
                let lbryURL: URL | null = null

                // Extract real link from youtube's redirect link
                if (source.platform === sourcePlatfromSettings['youtube.com']) {
                  if (!targetPlatforms.some(([key, platform]) => url.searchParams.get('q')?.startsWith(platform.domainPrefix))) continue
                  lbryURL = new URL(url.searchParams.get('q')!)
                }
                // Just directly use the link itself on other platforms
                else {
                  if (!targetPlatforms.some(([key, platform]) => url.href.startsWith(platform.domainPrefix))) continue
                  lbryURL = new URL(url.href)
                }

                if (lbryURL) {
                  target = {
                    lbryPathname: lbryURL.pathname.substring(1),
                    time: null,
                    type: lbryURL.pathname.substring(1).includes('/') ? 'video' : 'channel',
                    platform: targetPlatformSettings[settings.targetPlatform]
                  }
                  break
                }
              }
            }
          }

          if (!target) updateButton(null)
          else {
            // If target is a video target add timestampt to it
            if (target.type === 'video') {
              const videoElement = document.querySelector<HTMLVideoElement>(source.platform.htmlQueries.videoPlayer)
              if (videoElement) target.time = videoElement.currentTime > 3 && videoElement.currentTime < videoElement.duration - 1 ? videoElement.currentTime : null
            }

            updateButton({ target, source })
          }
        }
      } catch (error) {
        console.error(error)
      }
    })()

    urlHrefCache = url.href
  }

})()