document.addEventListener('DOMContentLoaded', () => {
    const products = [
        { name: 'Adidas Adizero Prime SP2', precio: 120000 },
        { name: 'Adidas PrimeX Blanca', precio: 350000 },
        { name: 'Adidas PrimeX Naranja', precio: 350000 },
        { name: 'Adidas UltraBoost', precio: 263000 },
        { name: 'Adidas UltraBoost W-B', precio: 263000 },
        { name: 'Adidas Gorra Running', precio: 40000 },
        { name: 'Nike Air Zoom Alphafly', precio: 350000 },
        { name: 'Nike Air Zoom Alphafly Blanca', precio: 350000 },
        { name: 'Nike Atletismo', precio: 275000 },
        { name: 'Nike Pasa Montania', precio: 80000 },
        { name: 'Nike Gorra Negra', precio: 35000 },
        { name: 'Nike Air Zoom Maxfly', precio: 275000 },
        { name: 'Puma FastRoid Nitro', precio: 269000 },
        { name: 'Puma FastRoid Nitro Blanca', precio: 269000 }
    ];

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    function actualizarCarrito() {
        const listaCarrito = document.getElementById('lista-carrito');
        if (!listaCarrito) return;
        listaCarrito.innerHTML = '';
        let total = 0;

        carrito.forEach((producto) => {
            const li = document.createElement('li');
            li.innerHTML = `${producto.name} - $${producto.precio.toLocaleString()} x ${producto.cantidad}`;
            listaCarrito.appendChild(li);
            total += producto.precio * producto.cantidad;

            const botonEliminar = document.createElement('button');
            botonEliminar.textContent = 'Eliminar';
            botonEliminar.onclick = () => eliminarProducto(producto.name);
            li.appendChild(botonEliminar);
        });

        document.getElementById('total').textContent = total.toLocaleString();
        localStorage.setItem('carrito', JSON.stringify(carrito));

        const metodoPago = document.getElementById('metodo-pago');
        metodoPago.style.display = carrito.length > 0 ? 'block' : 'none';
    }

    function agregarProducto(nombreProducto, precioProducto) {
        const productoEnCarrito = carrito.find(p => p.name === nombreProducto);
        if (productoEnCarrito) {
            productoEnCarrito.cantidad += 1;
        } else {
            carrito.push({ name: nombreProducto, precio: precioProducto, cantidad: 1 });
        }
        actualizarCarrito();
    }

    function eliminarProducto(nombre) {
        carrito = carrito.filter(p => p.name !== nombre);
        actualizarCarrito();
    }

    document.getElementById('carrito-icon').onclick = () => {
        const carritoElement = document.getElementById('carrito');
        carritoElement.style.display = carritoElement.style.display === 'none' ? 'block' : 'none';
        actualizarCarrito();
    };

    document.getElementById('vaciar-carrito').onclick = () => {
        carrito = [];
        actualizarCarrito();
    };

    // Aquí integramos SweetAlert para mostrar un mensaje de agradecimiento
    document.getElementById('finalizar-compra').onclick = () => {
        const carritoElement = document.getElementById('carrito');
        carritoElement.style.display = 'none';

        const metodoPago = document.getElementById('metodo-pago');
        metodoPago.style.display = carrito.length > 0 ? 'block' : 'none';
    };

    document.getElementById('confirmar-pago').onclick = () => {
        const metodoSeleccionado = document.querySelector('input[name="pago"]:checked');
        if (!metodoSeleccionado) {
            alert('Por favor selecciona un método de pago.');
            return;
        }

        let descuento = 0;
        switch (metodoSeleccionado.value) {
            case '1':
                descuento = 0.10; // 10% de descuento si elige efectivo
                break;
            case '2':
            case '3':
                descuento = 0; // No hay descuento si elige tarjeta o MercadoPago
                break;
        }

        const totalFinal = carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0) * (1 - descuento);

        // Actualizar el total en el carrito
        const totalFinalElement = document.getElementById('total-final');
        totalFinalElement.textContent = `Total a pagar: $${totalFinal.toLocaleString()}`;

        // Limpiar el carrito y actualizar visualmente
        carrito = [];
        actualizarCarrito();
        document.getElementById('metodo-pago').style.display = 'none';

        // Mostrar el mensaje de agradecimiento con SweetAlert
        Swal.fire({
            title: '¡Gracias por tu compra!',
            text: 'Total pagado: $' + totalFinal.toLocaleString(),
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
    };

    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    botonesAgregar.forEach(boton => {
        const nombreProducto = boton.dataset.producto;
        const precioProducto = parseInt(boton.dataset.precio, 10);

        boton.onclick = () => agregarProducto(nombreProducto, precioProducto);
    });

    actualizarCarrito();
});
