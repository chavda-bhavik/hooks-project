import React, { useState, useEffect, useRef } from 'react';

import Card from '../UI/Card';
import './Search.css';
import useHttp from '../hooks/http';
import ErrorModal from '../UI/ErrorModal';

const Search = React.memo(props => {
  const { onLoadIngredients } = props;
  const [ filter, setFilter ] = useState('')
  const inputRef = useRef()
  const { isLoading, data, error, sendRequest, clear } = useHttp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if(filter === inputRef.current.value) {
        const query = filter.length === 0 ? '' : `?orderBy="title"&equalTo="${filter}"`
        sendRequest("https://react-hooks-project-f1087.firebaseio.com/ingredients.json"+query, 'GET')
      }
    }, 500);
    return () => {
      clearTimeout(timer);
    }
  }, [filter, sendRequest, inputRef ])

  useEffect( () => {
    if(!isLoading && !error && data) {
      const loadedIngredients = []
      for(let key in data) {
        loadedIngredients.push({
          id: key,
          title: data[key].title,
          amount: data[key].amount
        })
      }
      onLoadIngredients(loadedIngredients)
    }
  }, [data, isLoading, error, onLoadIngredients ])

  return (
    <section className="search">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal> }
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          { isLoading && <span>Loading</span> }
          <input 
            ref={inputRef}
            type="text" 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
          />
        </div>
      </Card>
    </section>
  );
});

export default Search;