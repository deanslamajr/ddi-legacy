import React from 'react'
import styled from 'styled-components'
import shortid from 'shortid'

import {generateCellImageWithCaption} from '../helpers/konvaDrawingUtils'
import {S3_ASSET_FILETYPE} from '../config/constants.json'

function createImageFromUrl (url) {
  if (!url) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const imageObj = new window.Image();
    imageObj.onload = () => {
      resolve(imageObj)
    };
    // @todo handle error case
    imageObj.src = url;
  });
}

const CellImage = styled.img`
  width: 350px;
`;

export default class FullCell extends React.Component {
  state = {
    imageUrl: null
  }

  elementId = shortid.generate()

  componentDidMount () {
    this.generateImage();
  }

  componentDidUpdate (prevProps) {
    // if either the captionUrl or cellUrl changes, rerender image
    if (
      this.props.captionUrl !== prevProps.captionUrl ||
      this.props.cellUrl !== prevProps.cellUrl
    ) {
      this.generateImage();
    }
  }

  async generateImage () {
    // const [captionObj, cellObj] = await Promise.all[
    //   createImageFromUrl(captionUrl),
    //   createImageFromUrl(cellUrl)
    // ];

    const captionObj = await createImageFromUrl(this.props.captionUrl);
    const cellObj = await createImageFromUrl(this.props.cellUrl);

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