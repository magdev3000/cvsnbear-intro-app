import React from 'react';
import Modal from 'react-modal'
import './ReviewModal.scss';
import {MobileCancelMajorMonotone} from '@shopify/polaris-icons';
import {Button, Icon} from '@shopify/polaris'
// import ReviewIllustration from '../static/images/reviewModalBear.svg'

const giveReviewPath = `https://apps.shopify.com/ultimate-sticky-add-to-cart?#modal-show=ReviewListingModal`
const customModalStyles = {
  content : {
      top: '50%',
      left: '50%',
      marginRight: '-50%',
      right: 'auto',
      bottom: 'auto',
      height: '80%',
      width: '70%',
      minWidth:'500px',
      minHeight:'400px',
      maxHeight:'430px',
      maxWidth:'530px',
      transform: 'translate(-50%, -50%)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'column',
      padding: '20px 0px',
    }
}
const ReviewModal = ({isOpen, onRequestClose}) => {
  return (
      <Modal
      isOpen={isOpen}
      style={customModalStyles}
      onRequestClose={onRequestClose}
      contentLabel='Review'
      ariaHideApp={false}
      >
        <div className='reviewModalHeader'>
          <button 
          onClick={onRequestClose}
          className='modalCloseButton'
          >
            <Icon source={MobileCancelMajorMonotone}></Icon>
          </button>
        </div>
        <div
        className='reviewModalBody'
        >
          <img src='./static/images/reviewModalIllustration.svg'/>
          <h2>We ⭐️ you too!</h2>
          <p>As a fellow entrepreneur you know good reviews are the key to product success. Without reviews from shops like yours it's nearly impossible for us to get to new shops. Go ahead and leave a review in the Shopify app store, we'll be forever grateful 🙌</p>
          <Button
            className='reviewPromptPrimaryButton'
            primary={true}
            external={true}
            url={giveReviewPath}
            onClick={()=>{amplitude.logEvent('click_review_modal_write_a_review')}}
          >
            Write a Review
          </Button>
          <a 
          className='reviewPromptSecondaryButton'
          onClick={onRequestClose}>Maybe Later</a>
        </div>
    </Modal>
  )
}

export default ReviewModal