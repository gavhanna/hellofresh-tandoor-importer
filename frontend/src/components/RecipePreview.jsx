import { useState } from 'react';

export default function RecipePreview({ recipeData, onEdit, onImport, importing }) {
  const [editedData, setEditedData] = useState(recipeData);

  const handleFieldChange = (field, value) => {
    const updated = { ...editedData, [field]: value };
    setEditedData(updated);
    onEdit(updated);
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = { ...editedData };
    updated.ingredients[index][field] = value;
    setEditedData(updated);
    onEdit(updated);
  };

  const handleInstructionChange = (index, value) => {
    const updated = { ...editedData };
    updated.instructions[index].text = value;
    setEditedData(updated);
    onEdit(updated);
  };

  if (!recipeData) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Recipe Preview
        </h2>
        <p className="text-sm text-gray-600">
          Review and edit the extracted data before importing to Tandoor
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={editedData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Servings
          </label>
          <input
            type="number"
            value={editedData.servings}
            onChange={(e) =>
              handleFieldChange('servings', parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prep Time (min)
          </label>
          <input
            type="number"
            value={editedData.prepTime || ''}
            onChange={(e) =>
              handleFieldChange('prepTime', parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cook Time (min)
          </label>
          <input
            type="number"
            value={editedData.cookTime || ''}
            onChange={(e) =>
              handleFieldChange('cookTime', parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty
          </label>
          <select
            value={editedData.difficulty || 'medium'}
            onChange={(e) => handleFieldChange('difficulty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Ingredients
        </h3>
        <div className="space-y-2">
          {editedData.ingredients?.map((ingredient, index) => (
            <div key={index} className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) =>
                  handleIngredientChange(index, 'name', e.target.value)
                }
                placeholder="Ingredient"
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="text"
                value={ingredient.unit ? `${ingredient.amount} ${ingredient.unit}`.trim() : ingredient.amount}
                onChange={(e) => {
                  const parts = e.target.value.trim().split(' ');
                  handleIngredientChange(index, 'amount', parts[0]);
                  handleIngredientChange(index, 'unit', parts.slice(1).join(' ') || '');
                }}
                placeholder="Amount & Unit"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Instructions
        </h3>
        <div className="space-y-3">
          {editedData.instructions?.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {instruction.step}
              </div>
              <textarea
                value={instruction.text}
                onChange={(e) =>
                  handleInstructionChange(index, e.target.value)
                }
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition */}
      {editedData.nutrition && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Nutrition Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-600">Calories</p>
              <p className="font-semibold text-lg">{editedData.nutrition.calories}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-600">Protein</p>
              <p className="font-semibold text-lg">{editedData.nutrition.protein}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-600">Carbs</p>
              <p className="font-semibold text-lg">
                {editedData.nutrition.carbohydrates}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-600">Fat</p>
              <p className="font-semibold text-lg">{editedData.nutrition.fat}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {editedData.tags?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {editedData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Import Button */}
      <div className="pt-4 border-t">
        <button
          onClick={onImport}
          disabled={importing}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {importing ? 'Importing...' : 'Import to Tandoor'}
        </button>
      </div>
    </div>
  );
}
