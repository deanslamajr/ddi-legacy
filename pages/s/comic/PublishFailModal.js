import React from 'react'
import getConfig from 'next/config'
import styled from 'styled-components'
import ReCAPTCHA from 'react-google-recaptcha';

import { PinkMenuButton } from '../../../components/Buttons'
import Modal, { CenteredButtons, MessageContainer } from '../../../components/Modal'

const { publicRuntimeConfig } = getConfig()

const PublishFailModalContainer = styled(Modal)`
  height: inherit;
  width: inherit;
`

function PublishFailModal ({hasFailedCaptcha, onRetryClick, onCancelClick}) {
  const onChange = (captchaToken) => {
    onRetryClick(captchaToken);
  };

  const message = hasFailedCaptcha
    ? ''
    : 'There was an error while publishing :(';

  return (<PublishFailModalContainer onCancelClick={onCancelClick}>
    <MessageContainer>
      {message}
    </MessageContainer>
    <CenteredButtons>
      {hasFailedCaptcha
      ? <ReCAPTCHA
        sitekey={publicRuntimeConfig.CAPTCHA_V2_SITE_KEY}
        onChange={onChange}
      />
      : <PinkMenuButton onClick={() => onRetryClick()}>
        TRY AGAIN
      </PinkMenuButton>}
    </CenteredButtons>
  </PublishFailModalContainer>)
}

export default PublishFailModal