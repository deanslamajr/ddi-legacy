import React from 'react'
import styled from 'styled-components'
import shortid from 'shortid'

import {generateCellImageWithCaption} from '../helpers/konvaDrawingUtils'
import {S3_ASSET_FILETYPE} from '../config/constants.json'

function createImageFromUrl (url) {
  return new Promise((resolve, reject) => {
    const imageObj = new window.Image();
    imageObj.onload = () => {
      resolve(imageObj)
    };
    // @todo handle error case
    imageObj.src = url;
  })
}

const CellImage = styled.img`
  width: 350px;
`;

export default class FullCell extends React.Component {
  state = {
    imageUrl: null
  }

  elementId = shortid.generate()

  async componentDidMount () {
    const {captionUrl, cellUrl} = this.props;

    // const [captionObj, cellObj] = await Promise.all[
    //   createImageFromUrl(captionUrl),
    //   createImageFromUrl(cellUrl)
    // ];

    const captionObj = await createImageFromUrl(captionUrl);
    const cellObj = await createImageFromUrl(cellUrl);

    const fullCellBlob = await generateCellImageWithCaption(captionObj, cellObj, this.elementId);

    this.fullCellImageFile = new File([fullCellBlob], `${this.elementId}.png`, {
      type: S3_ASSET_FILETYPE,
    });

    const imageUrl = URL.createObjectURL(this.fullCellImageFile);

    this.setState({
      imageUrl
    })
  }

  render () {
    return (
      <React.Fragment>
        <div style={{display: 'none'}} id={this.elementId}></div>
        {this.state.imageUrl && <CellImage src={this.state.imageUrl} />}
      </React.Fragment>
    )
  }
}