import React, { useCallback, useReducer, useMemo } from 'react';

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
const httpReducer = (httpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { loading: true, error: null }
    case 'RESPONSE':
      return { ...httpState, loading: false}
    case 'ERROR':
      return { loading: false, error: action.error }
    case 'CLEAR':
      return { loading: false, error: null }
    default:
      throw new Error("Should not get there!")
  }
}

const Ingredients = () => {
  const [userIngredients, dispatchIngredient] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: false, error: null});

  const addIngredientHandler = useCallback(ingredient => {
    dispatchHttp({ type: 'SEND' });
    fetch("https://react-hooks-project-f1087.firebaseio.com/ingredients.json", {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then( response => {
      return response.json()
    })
    .then( data => {
      dispatchHttp({ type: 'RESPONSE' })
      dispatchIngredient({
        type: 'ADD',
        ingredient: {
            id: data.name, 
            ...ingredient    
        }
      })
    }).catch(err => dispatchHttp({ type: 'ERROR', error: err.message }))
  }, [])

  const removeIngredientHandler = useCallback(id => {
    dispatchHttp({ type: 'SEND' })
    fetch(`https://react-hooks-project-f1087.firebaseio.com/ingredients/${id}.json`, {
      method: 'DELETE',
    }).then( response => {
      dispatchHttp({ type: 'RESPONSE' })
      dispatchIngredient({
        type: 'DELETE',
        id: id
      })
    }).catch( err => dispatchHttp({ type: 'ERROR', error: err.message }) )
  },[])

  const filterIngredientsHandler = useCallback(ings => {
    dispatchIngredient({
      type: 'SET',
      ingredients: ings
    })
  }, []);

  const clearError = useCallback(() => {
    dispatchHttp({ type: 'CLEAR' })
  },[])

  const ingredientList = useMemo(() => {
    return <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
  }, [userIngredients, removeIngredientHandler])

  return (
    <div className="App">
      { httpState.error && <ErrorModal onClose={clearError} >{httpState.error}</ErrorModal> }
      <IngredientForm
        addIngredient={addIngredientHandler} 
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler}/>
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
