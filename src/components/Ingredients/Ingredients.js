import React, { useState,  useCallback, useReducer } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from './../UI/ErrorModal'
import Search from './Search';

const ingredientReducer = (currentIngredients, action) => {
  switch(action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient]
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Should not get there!')
  }
}

const Ingredients = () => {
  const [userIngredients, dispatchIngredientAction] = useReducer(ingredientReducer, []);
  //const [ ingredients, setIngredients ] = useState([]);
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
      dispatchIngredientAction({
        type: 'ADD',
        ingredient: {
            id: data.name, 
            ...ingredient    
        }
      })
    }).catch(err => setError(err.message))
  }

  const removeIngredientHandler = id => {
    setIsLoading(true);
    fetch(`https://react-hooks-project-f1087.firebaseio.com/ingredients/${id}.json`, {
      method: 'DELETE',
    }).then( response => {
      setIsLoading(false);
      dispatchIngredientAction({
        type: 'DELETE',
        id: id
      })
    }).catch( err => {
      setError(err.message);
    })
  }

  const filterIngredientsHandler = useCallback(ings => {
    dispatchIngredientAction({
      type: 'SET',
      ingredients: ings
    })
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
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
      </section>
    </div>
  );
}

export default Ingredients;
