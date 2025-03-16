'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { useProduct } from './product-context';
import { TextCustomization } from 'lib/types/customization';
import { HatPreview } from './hat-preview';
import { TextCustomizationInput } from './text-customization-input';
import { validateCustomization } from 'lib/validation';

export function CustomizeHatModal({
  isOpen,
  closeModal,
}: {
  isOpen: boolean;
  closeModal: () => void;
}) {
  const { state, updateCustomization } = useProduct();
  const [textCustomization, setTextCustomization] = useState<TextCustomization>(
    {
      line1: '',
      line2: '',
    }
  );
  const [errors, setErrors] = useState<{ line1?: string; line2?: string }>({});

  // Initialize with existing customization if available
  useEffect(() => {
    if (state.customization) {
      setTextCustomization({
        line1: state.customization.line1 || '',
        line2: state.customization.line2 || '',
      });
    }
  }, [state.customization, isOpen]);

  const handleTextChange = (field: keyof TextCustomization, value: string) => {
    setTextCustomization((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user types in the field with an error
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSave = () => {
    // Validate customization
    const validationResult = validateCustomization(textCustomization);

    if (!validationResult.valid) {
      setErrors(validationResult.errors);
      return;
    }

    // Update customization in context
    updateCustomization(textCustomization);
    closeModal();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-black">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  Customize Your Hat
                </Dialog.Title>
                <div className="mt-4">
                  <HatPreview
                    color={state.color || ''}
                    style={state.style || ''}
                    textLine1={textCustomization.line1}
                    textLine2={textCustomization.line2}
                  />
                </div>
                <div className="mt-4">
                  <TextCustomizationInput
                    label="Line 1 (Required)"
                    value={textCustomization.line1}
                    onChange={(value) => handleTextChange('line1', value)}
                    maxLength={20}
                    error={errors.line1}
                    placeholder="Enter text for front of hat"
                  />
                </div>
                <div className="mt-4">
                  <TextCustomizationInput
                    label="Line 2 (Optional)"
                    value={textCustomization.line2 || ''}
                    onChange={(value) => handleTextChange('line2', value)}
                    maxLength={20}
                    error={errors.line2}
                    placeholder="Enter additional text"
                  />
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleSave}
                  >
                    Save Customization
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
