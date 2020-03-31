import React, { useCallback, useReducer, useMemo, useEffect } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from './../UI/ErrorModal'
import Search from './Search';

import useHttp from './../hooks/http'

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
  const [userIngredients, dispatchIngredient] = useReducer(ingredientReducer, []);
  const { isLoading, error, sendRequest, data, reqExtra, identifier, clear } = useHttp();

  useEffect(() => {
    if(!isLoading && identifier === "REMOVE_INGREDIENT") {
      dispatchIngredient({ type: 'DELETE', id: reqExtra })
    } else if(!isLoading && !error && identifier === "ADD_INGREDIENT") {
      dispatchIngredient({
        type: 'ADD',
        ingredient: {
          id: data.name, 
          ...reqExtra
        }
      })
    }
  }, [data, reqExtra, identifier, isLoading, error])

  const addIngredientHandler = useCallback(ingredient => {
    sendRequest(
      "https://react-hooks-project-f1087.firebaseio.com/ingredients.json",
      "POST",
      JSON.stringify(ingredient),
      ingredient,
      'ADD_INGREDIENT'
    )
  }, [sendRequest])

  const removeIngredientHandler = useCallback(id => {
    sendRequest(
      `https://react-hooks-project-f1087.firebaseio.com/ingredients/${id}.json`, 
      'DELETE',
      null,
      id,
      'REMOVE_INGREDIENT'
    )
  },[sendRequest])

  const filterIngredientsHandler = useCallback(ings => {
    dispatchIngredient({
      type: 'SET',
      ingredients: ings
    })
  }, []);

  const ingredientList = useMemo(() => {
    return <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
  }, [userIngredients, removeIngredientHandler])

  return (
    <div className="App">
      { error && <ErrorModal onClose={clear} >{error}</ErrorModal> }
      <IngredientForm
        addIngredient={addIngredientHandler} 
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler}/>
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
