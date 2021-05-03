import React, {Component} from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import './OnboardingWizard.scss';
import { Link, Icon } from '@shopify/polaris';
import { TickSmallMinor } from '@shopify/polaris-icons';
import { setSettings as setSettingsAction, getUrlProduct } from '../redux/actions';
import ReviewModal from './ReviewModal';
import { ReviewStarFull, ReviewStarEmptyYellowEdges } from '../components/illustrations';
import { I18n } from 'react-redux-i18n';


const provideFeedbackPath = `https://www.cvsnbear.com/feedback`
const reviewTextIndicator =[
  I18n.t('Pretty bad'),
  I18n.t('Not so good'),
  I18n.t('Good'),
  I18n.t('Very good'),
  I18n.t('Awesome')
]

class OnboardingWizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRank: 0,
      modalActive: false,
    };
    this.hideStars = this.hideStars.bind(this)
    this.showStars = this.showStars.bind(this)
    this.handleModalOpen = this.handleModalOpen.bind(this)
    this.handleModalClose = this.handleModalClose.bind(this)
  }

  handleModalOpen(){
    this.setState({ 
        modalActive: !this.state.modalActive,
     })
  }

  handleModalClose(){
    this.setState({ 
        modalActive: !this.state.modalActive,
     })
  }

  hideStars(){
    this.setState({selectedRank: 0})
  }

  showStars(num){
    this.setState({selectedRank: num})
  }

  render(){
    const {
      bar_tested,
      shopify_domain,
      isActive
    } = this.props
    return(
      <div className="BarNotice">
          { !bar_tested ?
            <div>
                <div className="title"> <span role="img" aria-label="welcome">👋</span> {I18n.t('Welcome to {{app_name}}')}</div>
                <div className="content-block">
                  <p>{I18n.t('Setting up is easy as 1-2-3! Follow these steps to set up {{app_name}} in your store:')}</p>
                  <div className="steps">
                    <div className="step-item active">
                      <div className="icon">
                        <Icon color="white" source={TickSmallMinor} />
                      </div>
                      <div className="title-item">{I18n.t('Install the app')}</div>
                    </div>
                    <div className={classNames("step-item", { active: this.props.isActive })}>
                      <div className="icon">
                        <Icon color="white" source={TickSmallMinor} />
                        <span className="number">2</span>
                      </div>
                      <div className="title-item">{I18n.t('Enable the app in your store')}</div>
                    </div>
                    <div className={classNames("step-item", { active: this.props.bar_tested })}>
                      <div className="icon">
                        <Icon color="white" source={TickSmallMinor} />
                        <span className="number">3</span>
                      </div>
                      <div className="title-item">
                      {I18n.t('See it live in your store')}
                        <Link
                          onClick={() => {
                            this.props.setSettings({ bar_tested: true });
                          }}
                          url={`https://${this.props.shopify_domain}`}
                          external
                        >
                          &nbsp;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            :
      <div className='onboardingReviewBarContainer'>
        <img 
        className='onboardingReviewIllustration'
        src='./static/images/masterBear.svg'
        />
        <img src='./static/images/reviewModalIllustration.svg' style={{display: 'none'}}/>
        <div className='onboardingreviewBarText'>
            <h2 className='Polaris-Heading'>{I18n.t('Good Job, you’re now a Cart Champion!')}</h2>
            <p>{I18n.t('Let us know what you think about the app 👉')}</p>
            <div className="action">
                <Link onClick={() => { this.props.setSettings({ bar_notice_hidden: true }); }}>{I18n.t('Close')}</Link>
              </div>
        </div>
        <div className='onboardingReviewBar'>
          <a 
          href={provideFeedbackPath}
          target='blank'
          >
            <div 
            className='onboardingReviewStar'
            onMouseOver={() => {this.showStars(1)}}
            onMouseOut={this.hideStars}
            onClick={()=>{amplitude.logEvent('click_review',{value: 1, origin: 'onboarding'})}}
            >
              {(this.state.selectedRank > 0 ) ? 
              <ReviewStarFull/> :
              <ReviewStarEmptyYellowEdges/> 
              }
            </div>
          </a>
          <a 
          href={provideFeedbackPath}
          target='blank'
          >
            <div 
            className='onboardingReviewStar'
            onMouseOver={() => {this.showStars(2)}}
            onMouseOut={this.hideStars}
            onClick={()=>{amplitude.logEvent('click_review',{value: 2, origin: 'onboarding'})}}
            >
              {(this.state.selectedRank > 1 ) ? 
                <ReviewStarFull/> :
                <ReviewStarEmptyYellowEdges/> 
              }
            </div>
          </a>
          <a 
          href={provideFeedbackPath}
          target='blank'
          >
            <div 
            className='onboardingReviewStar'
            onMouseOver={() => {this.showStars(3)}}
            onMouseOut={this.hideStars}
            onClick={()=>{amplitude.logEvent('click_review',{value: 3, origin: 'onboarding'})}}
            >
              {(this.state.selectedRank > 2 ) ? 
              <ReviewStarFull/> :
              <ReviewStarEmptyYellowEdges/> 
              }
            </div>
          </a>
          <a 
          href={provideFeedbackPath}
          target='blank'
          >
            <div 
            className='onboardingReviewStar'
            onMouseOver={() => {this.showStars(4)}}
            onMouseOut={this.hideStars}
            onClick={()=>{amplitude.logEvent('click_review',{value: 4, origin: 'onboarding'})}}
            >
              {(this.state.selectedRank > 3 ) ? 
                <ReviewStarFull/> :
                <ReviewStarEmptyYellowEdges/> 
              }
            </div>
          </a>
          <div 
          className='onboardingReviewStar'
          onMouseOver={() => {this.showStars(5)}}
          onMouseOut={this.hideStars}
          onClick={()=>{
            this.handleModalOpen()
            amplitude.logEvent('click_review',{value: 5, origin: 'onboarding'}
            )}}
          >
            {(this.state.selectedRank > 4 ) ? 
              <ReviewStarFull/> :
              <ReviewStarEmptyYellowEdges/> 
            }
          </div>
          <div className='onboardingReviewTextIndicator'>
              {(this.state.selectedRank > 0 ) &&
              <p>{reviewTextIndicator[this.state.selectedRank - 1]}</p>}
          </div>
          <div className='review-step-container'>
          </div>
        </div>
      <ReviewModal
        isOpen={this.state.modalActive}
        onRequestClose={this.handleModalClose}
      />
    </div>
          }
          <div className="notFullWidthHr"></div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isActive: state.status.isActive || false,
  bar_tested: state.settings.data.bar_tested || false,
  shopify_domain: state.settings.data.shopify_domain || false,
});

const mapDispatchToProps = {
  setSettings: setSettingsAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(OnboardingWizard);

