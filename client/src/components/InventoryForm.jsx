import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
} from '../services/inventoryApi';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

/**
 * Inventory Form Component
 * Used for adding/editing inventory items
 */
const InventoryForm = ({ inventory, onSuccess, onClose }) => {
  const [createInventory, { isLoading: isCreating }] = useCreateInventoryMutation();
  const [updateInventory, { isLoading: isUpdating }] = useUpdateInventoryMutation();

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: '',
      quantity: '',
      unit: 'piece',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .required('Name is required'),
      description: Yup.string()
        .max(500, 'Description cannot exceed 500 characters'),
      price: Yup.number()
        .min(0, 'Price cannot be negative')
        .required('Price is required'),
      quantity: Yup.number()
        .integer('Quantity must be an integer')
        .min(0, 'Quantity cannot be negative')
        .required('Quantity is required'),
      unit: Yup.string()
        .max(50, 'Unit cannot exceed 50 characters'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const data = {
          name: values.name.trim(),
          description: values.description.trim() || undefined,
          price: parseFloat(values.price),
          quantity: parseInt(values.quantity),
          unit: values.unit.trim() || 'piece',
        };

        if (inventory) {
          await updateInventory({ id: inventory._id, ...data }).unwrap();
        } else {
          await createInventory(data).unwrap();
        }

        formik.resetForm();
        onSuccess();
      } catch (err) {
        const errorMessage = err?.data?.error || 'An error occurred. Please try again.';
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            if (['name', 'description', 'price', 'quantity', 'unit'].includes(fieldName)) {
              setFieldError(fieldName, validationError.message);
            }
          });
        } else {
          setFieldError('name', errorMessage);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (inventory) {
      formik.setValues({
        name: inventory.name || '',
        description: inventory.description || '',
        price: inventory.price || '',
        quantity: inventory.quantity || '',
        unit: inventory.unit || 'piece',
      });
    } else {
      formik.resetForm();
    }
  }, [inventory]);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Item Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter item name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-invalid={formik.touched.name && formik.errors.name ? 'true' : 'false'}
        />
        {formik.touched.name && formik.errors.name ? (
          <p className="text-sm text-destructive">{formik.errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Enter item description"
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-invalid={formik.touched.description && formik.errors.description ? 'true' : 'false'}
        />
        {formik.touched.description && formik.errors.description ? (
          <p className="text-sm text-destructive">{formik.errors.description}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">
            Price <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={formik.touched.price && formik.errors.price ? 'true' : 'false'}
          />
          {formik.touched.price && formik.errors.price ? (
            <p className="text-sm text-destructive">{formik.errors.price}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">
            Quantity <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            placeholder="0"
            value={formik.values.quantity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={formik.touched.quantity && formik.errors.quantity ? 'true' : 'false'}
          />
          {formik.touched.quantity && formik.errors.quantity ? (
            <p className="text-sm text-destructive">{formik.errors.quantity}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit (Optional)</Label>
        <Input
          id="unit"
          name="unit"
          type="text"
          placeholder="e.g., piece, box, set"
          value={formik.values.unit}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-invalid={formik.touched.unit && formik.errors.unit ? 'true' : 'false'}
        />
        {formik.touched.unit && formik.errors.unit ? (
          <p className="text-sm text-destructive">{formik.errors.unit}</p>
        ) : null}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={isCreating || isUpdating}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isCreating || isUpdating || formik.isSubmitting}
        >
          {isCreating || isUpdating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {inventory ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            inventory ? 'Update Item' : 'Create Item'
          )}
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm;
