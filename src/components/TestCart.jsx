import { useState } from 'react';

const TestCart = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 bg-blue-500 text-white p-4 rounded-full z-50"
      >
        Test Cart
      </button>

      {/* Test Cart Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[280px] bg-red-500 z-[100] transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 text-white">
          <h2 className="text-xl font-bold">Test Cart</h2>
          <p>This should slide from the right</p>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 bg-white text-red-500 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default TestCart;