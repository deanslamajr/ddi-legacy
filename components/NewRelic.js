import Head from 'next/head'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

function isServer() {
  return !(typeof window != 'undefined' && window.document)
}

function NewRelic() {
  if (isServer()) {
    return null
  }

  const browserKey = publicRuntimeConfig.NR_BROWSER_KEY
  const appId = publicRuntimeConfig.NR_APP_ID_LEGACY_DDI_CLIENT
  const accountId = publicRuntimeConfig.NR_ACCOUNT_ID

  window.__newRelic = {
    appId,
    accountId,
    browserKey,
  }

  return (
    <Head>
      <script type="text/javascript" src="../newRelic.js"></script>
    </Head>
  )
}

export default NewRelic
