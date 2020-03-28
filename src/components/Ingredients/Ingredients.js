import React, { useState,  useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from './../UI/ErrorModal'
import Search from './Search';


const Ingredients = () => {
  const [ ingredients, setIngredients ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState()

  const addIngredientHandler = ingredient => {
    setIsLoading(true);
    fetch("https://react-hooks-project-f1087.firebaseio.com/ingredients.json", {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then( response => {
      return response.json()
    })
    .then( data => {
      setIsLoading(false);
      setIngredients( prevIngredients => [
          ...prevIngredients, 
          { 
            id: data.name, 
            ...ingredient
          }
        ]
      )
    }).catch(err => setError(err.message))
  }

  const removeIngredientHandler = id => {
    setIsLoading(true);
    fetch(`https://react-hooks-project-f1087.firebaseio.com/ingredients/${id}.json`, {
      method: 'DELETE',
    }).then( response => {
      setIsLoading(false);
      setIngredients( prevIngredients => prevIngredients.filter( ing => ing.id !== id) )
    }).catch( err => {
      setError(err.message);
    })
  }

  const filterIngredientsHandler = useCallback(ings => {
    setIngredients(ings);
  }, []);
  const clearError = () => {
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm 
        addIngredient={addIngredientHandler} 
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler}/>
        <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler}/>
      </section>
    </div>
  );
}

export default Ingredients;
