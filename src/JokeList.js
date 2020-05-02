import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";


/** List of jokes. */

function JokeList({ numJokesToGet = 5 }) {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  
  const getJokes = useCallback(async () => {
    try {
      // load jokes one at a time, adding not-yet-seen jokes
      let newJokes = [];
      let seenJokes = new Set();

      while (newJokes.length < numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { ...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          newJokes.push({ ...joke, votes: 0 });
        } else {
          console.log("duplicate found!");
        }
      }
      setJokes(newJokes);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  }, [numJokesToGet])

  async function getSavedJokes(){
    let savedJokes = [];
    let savedJokeId = '';
    let savedJokeVote = '';
    for(let i = 0; i < numJokesToGet; i++){
      [savedJokeId, savedJokeVote] = window.localStorage.getItem(`votedJokes${i}`).split(' ');
      let res = await axios.get(`https://icanhazdadjoke.com/j/${savedJokeId}`);
      let { ...joke } = res.data;
      savedJokes.push({...joke, votes: Number(savedJokeVote)})
    }
    setJokes(savedJokes);
    setIsLoading(false);
  }

  useEffect(() => {
    if(window.localStorage.getItem('votedJokes0')){
      getSavedJokes()
    }else{
      getJokes();
    }
  }, [getJokes])

  useEffect(()=> {
    jokes.forEach((joke, i) => {
     let savedJoke = `${joke.id} ${joke.votes}`;
      window.localStorage.setItem(`votedJokes${i}`, savedJoke);
    })
    // console.log(jokes);
  },[jokes])


  function generateNewJokes() {
    setIsLoading(true);
    getJokes();
  }

  function vote(id, delta) {
    setJokes(jokes.map(j =>
      j.id === id ? { ...j, votes: j.votes + delta } : j
    ))
  };

  const sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
  if (isLoading) {
    return (
      <div className="loading">
        <i className="fas fa-4x fa-spinner fa-spin" />
      </div>
    )
  }

  return (
    <div className="JokeList">
      <button
        className="JokeList-getmore"
        onClick={generateNewJokes}
      >
        Get New Jokes
      </button>

      {sortedJokes.map(j => (
        <Joke
          text={j.joke}
          key={j.id}
          id={j.id}
          votes={j.votes}
          vote={vote}
        />
      ))}
    </div>
  );
}

export default JokeList;
