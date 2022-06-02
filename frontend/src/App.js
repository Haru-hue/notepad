import React, {useEffect, useState} from "react"
import Die from "./components/Die"
import user from './var/atom'
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'
import { useStopwatch } from 'react-timer-hook';
import { nanoid } from "nanoid"
import { useAtom } from 'jotai';
import axios from "axios"
import "./App.css"

function App () {
    const [dice, setDice] = useState(allNewDice())
    const [tenzies, setTenzies] = useState(false)
    const [game, setGame] = useState(false)
    const [player, setPlayer] = useAtom(user)    

    const { width, height } = useWindowSize()
    const {seconds, minutes,start, pause,reset} = useStopwatch({ autoStart: true });

    const confetti = (
        <Confetti
        width={width}
        height={height}
      />
    )

    useEffect(() => {
        const check = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allValues = dice.every(die => die.value === firstValue)
        if(check && allValues) {
            setTenzies(true)
            pause()
        }
    }, [dice, pause])

    function generateNewDice () {
        return {
            value: Math.floor(Math.random() * 6),
            id: nanoid(),
            isHeld: false
        }   
    }

    function allNewDice() {
        const newDice = []
        for (var i = 0;i<10;i++) {
            newDice.push(generateNewDice())
        }
        return newDice
    }

    function rollDice() {
        if(!tenzies) {
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? die : generateNewDice()
            }))
        } else {
            setTenzies(false)
            reset()
            setDice(allNewDice())
        }
    }

    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? {...die, isHeld: !die.isHeld} : die
        }))
    }

    const diceElements = dice.map(die => {
        return <Die isHeld={die.isHeld} value={die.value}
                key={die.id} holdDice={()=>holdDice(die.id)}/>
    })

    function handleChange (event) {
        const { value } = event.target
        setPlayer(value)
    }

    const submitUser = async () => {
        const username = player

        const result = await fetch('http://localhost:5000/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(username)
        })

        const JSONResult = await result.json()
        console.log(JSONResult)
    }

    function startGame () {
        if(player.length>=3 || player.length<=10)  {
            setGame(true)
           start()
        } else if(player === "") {
            alert("Enter a username to play")
        }
        else {
            alert(`Let the username between 3-10 characters`)
        }
        axios.post("http://localhost:5000/api", { player: player }).then((res) => {
            console.log(res);
        });
    }
    return (
        <main>
            
            {
                !game ?
                <div className="new-game">
                    <h2 className="title">Enter Username:</h2>
                    <input 
                        type="text"
                        className="input--box"
                        name="player"
                        placeholder="Enter your name"
                        onChange={handleChange}
                    />
                        <button 
                            onClick = {startGame}
                            className="dice--button">
                        Start Game
                    </button>
                </div>
                 :
            <>
            <div className="game">
                 {tenzies ? confetti : ""}
                <h2 className="title">Tenzies</h2>
                <div className="instructions">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</div>
                <div className="container">
                    {diceElements}
                </div>
                <button 
                onClick = {rollDice}
                className="dice--button">
                    {tenzies ? "New Game" : "Roll"}
                </button>
            </div>
            <div className="player">
                   <h3 className="player--name">Current player:<br/>
                    <div className="user">{player}</div></h3>
                    <div>
                    <h3 className="player--name">Time elapsed:<br/>
                    {minutes}:{seconds > 9 ? "" : "0"}{seconds}</h3>
                    </div>
                </div>
            </>
            }
        </main>
    )
}

export default App