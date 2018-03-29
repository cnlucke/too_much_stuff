import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FoundBox from './FoundBox'
import MissionBox from './MissionBox'
import ItemList from './ItemList'
import DummyTimer from './DummyTimer'
import Leaderboard from './Leaderboard'
import Timer from './Timer'
import fireworks from '../images/fireworks.gif'

export default class Game extends Component {
  state = {
    imgs: [],
    found: [],
    mission: [],
    won: false,
    time: 0,
    started: false,
    top: [],
    bottom: [],
    leaderboard: false,
    foundBoxPosition: null,
  }

  componentDidMount() {
    const position = (
      ReactDOM
        .findDOMNode(this.refs['found'])
        .getBoundingClientRect()
   )
   this.setState({foundBoxPosition: position}, () => console.log("GAME STATE:", this.state))
  }

  startGame = () => {
    console.log("STARTING GAME")
    fetch('http://localhost:3000/items')
    .then(res => res.json())
    .then(imgs => {
      console.log("imgs fetch:", imgs)
      const mission = imgs.slice(0, 3)
      const rand = Math.floor(Math.random() * (imgs.length - 5))
      const top = imgs.slice(rand, rand + 6)
      let bottom = imgs.slice(0, rand)
      bottom = [...bottom, ...imgs.slice(rand + 6)]
      // add coordinates to top and bottom arrays
      const topWithCoords = this.buildImgCoordinates(top, "top")
      const bottomWithCoords = this.buildImgCoordinates(bottom, "bottom")
      const allImgs = [...topWithCoords, ...bottomWithCoords]
      this.setState({ imgs: allImgs, mission, top, bottom, won: false, found: [], started: true })
    })
  }

  buildImgCoordinates = (list, listType) => {
    return list.map((img) => ({...img, ...this.getCoordinates(listType)}) )
  }

  getCoordinates = (listType) => {
    let divStyle1 = {
      x: Math.floor(Math.random() * 251),
      y: Math.floor(Math.random() * 201),
    }

    let divStyle2 = {
      x: Math.floor(Math.random() * 501),
      y: Math.floor(Math.random() * 376),
    }

    return listType === "top" ? divStyle1 : divStyle2
  }

  findTheMovingItemOnMouseDown = (e, id) => {
    // find item with matching id
    const item = this.state.imgs.find(item => item.id === id)
    const index = this.state.imgs.indexOf(item)

    this.setState({
      oldMouseX: e.clientX,
      oldMouseY: e.clientY,
      holdIndex: index,
    });
  }


  handleItemClick = (img) => {
    let foundImgs = this.state.found
    const filteredTopImgsLeft = this.state.top.filter((item) => item.name !== img.name)
    const filteredBottomImgsLeft = this.state.bottom.filter((item) => item.name !== img.name)
    if (!this.state.found.includes(img) && this.state.mission.includes(img)) foundImgs = [...this.state.found, img]
    const uniqFoundImgs = foundImgs.filter((item, index) => foundImgs.indexOf(item) === index)
    this.setState({ found: uniqFoundImgs, top: filteredTopImgsLeft, bottom: filteredBottomImgsLeft}, () => this.handleWin())
  }

  handleWin = () => {
    if (this.state.mission.length === this.state.found.length) {
      this.setState({ won: true, started: false }, () => {
        console.log("GAME STARTED?", this.state.started)
        //POST game to /games
        const options = {
          method: 'post',
          headers: {
            "Content-Type": 'application/json',
            Accepts: 'application/json'
          },
          body: JSON.stringify({ "game": {"username": this.props.currentUser.username, "time": this.state.time} })
        }

        fetch('http://localhost:3000/games', options)
          .then(res => res.json())
          .then(game => console.log("GAME PERSISTED:", game))
      }
    )}
  }

  showLeaderboard = () => {
    this.setState({leaderboard: true})
  }

  hideLeaderboard = () => {
    this.setState({leaderboard: false})
  }

  setFinalTime = (seconds) => {
    this.setState({time: seconds})
  }

  render() {
    return(
      <div id="game">
        <div id="game-status">
          { (this.state.started) ? <Timer won={this.state.won} handleFinalTime={this.setFinalTime}/>
             : <DummyTimer won={this.state.won} time={this.state.time}/>
          }
          <FoundBox  ref={"found"} found={this.state.found} won={this.state.won} user={this.props.currentUser}/>
          <MissionBox  mission={this.state.mission} />

        </div>
        <div id="image_container">
          { (this.state.won) ?
            <div>
              <div id="winning">{`YOU WON, ${this.props.currentUser.username.toUpperCase()}!!!!`}</div>
              <img src={fireworks} id="fireworks1" alt="bang bang"/>
              <img src={fireworks} id="fireworks2" alt="bang bang"/>
            </div>
            : null
          }

          { (!this.state.started) ?
            ((this.state.leaderboard) ?
            <Leaderboard handleBack={this.hideLeaderboard}/>
            :
            <div className="buttons-area">
              <button className={'game_button'} id={"start"} onClick={this.startGame}>
                <p id="button-start-game-text">START GAME</p> Find the items!
              </button>
              <button className={'game_button'} id={"leaderboard"} onClick={this.showLeaderboard}>
                <p id="button-start-game-text">LEADERBOARD</p>
              </button>
              <button id={'change-player'} onClick={this.props.handleChangePlayer}>Change Player</button>
            </div>)
            : null
          }

          <div id="item-location-1">
            <ItemList id="location-1" className="item" list={this.state.top} findTheMovingItem={this.findTheMovingItemOnMouseDown}/>
          </div>
          <div id="item-location-2">
            <ItemList id="location-2" className="item" list={this.state.bottom} findTheMovingItem={this.findTheMovingItemOnMouseDown}/>
          </div>
        </div>

    </div>
    )
  }
}


// barbie
// tuba
// #1 dad mug
// monopoly piece
//
//
