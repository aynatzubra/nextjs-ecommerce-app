const mockItems = [
  {
    id: 1,
    name: 'Example product #1',
    price: 199,
    currency: 'USD',
    quantity: 1,
    image: 'https://placehold.co/100x100/purple/white?text=Img',
  },
  {
    id: 2,
    name: 'Example product #2',
    price: 49,
    currency: 'USD',
    quantity: 2,
    image: 'https://placehold.co/100x100/purple/white?text=Img',
  },
]

export function CartDetailsStatic() {
  const subtotal = mockItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="container mx-auto p-6 font-sans">
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#111111] text-white">
              {/* Cell for cress */}
              <th className="p-4 text-left w-12 rounded-tl-2xl"></th>
              {/* Cell for image */}
              <th className="p-4 w-24"></th>
              <th className="p-4 text-left font-bold">Product</th>
              <th className="p-4 text-center font-bold">Price</th>
              <th className="p-4 text-center font-bold">Quantity</th>
              <th className="p-4 text-center font-bold rounded-tr-2xl">Subtotal</th>
            </tr>
          </thead>

          {/* Products List */}
          <tbody className="bg-white">
            {mockItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                {/* Remove btn */}
                <td className="p-4 text-center border-l border-gray-200">
                  <button className="text-red-500 hover:text-red-700 font-bold text-xl">×</button>
                </td>

                {/* Product Image */}
                <td className="p-4">
                  <div className="w-16 h-16 bg-purple-100 p-1">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                </td>

                {/* Product name */}
                <td className="p-4 text-gray-900 font-bold border-r border-gray-200">{item.name}</td>

                {/* Price */}
                <td className="p-4 text-center text-gray-600 border-r border-gray-200">
                  {item.currency}
                  {item.price.toFixed(2)}
                </td>

                {/* quantity */}
                <td className="p-4 text-center border-r border-gray-200">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1">
                    <button
                      type="button"
                      className="text-lg leading-none text-gray-500 hover:text-gray-800"
                      // TODO: onClick with updateQuantity(productId, quantity - 1)
                    >
                      −
                    </button>

                    <span className="min-w-[2ch] text-center text-sm text-gray-900">{item.quantity}</span>

                    <button
                      type="button"
                      className="text-lg leading-none text-gray-500 hover:text-gray-800"
                      // TODO: onClick with updateQuantity(productId, quantity + 1)
                    >
                      +
                    </button>
                  </div>
                </td>

                {/* Summary */}
                <td className="p-4 text-center text-gray-600 border-r border-gray-200">
                  {item.currency}
                  {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Block */}
      <div className="flex justify-end space-y-4">
        <div className="w-full md:w-1/2 lg:w-1/3 border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold tracking-tight">Order summary</h2>

          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Subtotal</dt>
              <dd className="font-medium text-zinc-900">{subtotal} USD</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Shipping</dt>
              <dd className="text-zinc-500">Calculated at checkout</dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-zinc-200 pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-zinc-500">Total</span>
              <span className="text-lg font-semibold text-zinc-900">{subtotal} USD</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              className="w-full rounded-full bg-zinc-900 px-4 py-4 text-sm uppercase font-bold text-zinc-50 hover:bg-zinc-800"
            >
              Proceed to checkout
            </button>
            <button
              type="button"
              className="w-full rounded-full border border-zinc-300 px-4 py-4 text-sm uppercase font-bold text-zinc-700 hover:bg-zinc-100"
            >
              Clear cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
