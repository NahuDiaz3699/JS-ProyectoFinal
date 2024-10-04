document.addEventListener('DOMContentLoaded', async () => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    async function fetchProductos() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            if (!response.ok) {
                throw new Error('Error al obtener los productos');
            }
            const productos = await response.json();
            return productos.slice(0, 5);
        } catch (error) {
            console.error('Hubo un problema con la solicitud:', error);
            return [];
        }
    }

    const productos = await fetchProductos();

    // Definimos productos simulados
    const products = productos.map(producto => ({
        name: producto.title,
        precio: Math.floor(Math.random() * 100000) + 10000
    }));

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
        mostrarToast();
    }

    function mostrarToast() {
        const toast = document.getElementById('toast');
        toast.classList.add('show');

        // Ocultar el toast después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
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
        document.getElementById('total-final').textContent = 'Total a pagar: $0';
    };

    document.getElementById('finalizar-compra').onclick = () => {
        const carritoElement = document.getElementById('carrito');
        carritoElement.style.display = 'none';
        const metodoPago = document.getElementById('metodo-pago');
        metodoPago.style.display = carrito.length > 0 ? 'block' : 'none';
    };

    // Manejo de selección de método de pago y cuotas
    const selectCuotas = document.getElementById('select-cuotas');
    document.querySelectorAll('input[name="pago"]').forEach(radio => {
        radio.onchange = () => {
            if (radio.value === '2') {
                selectCuotas.style.display = 'block';
            } else {
                selectCuotas.style.display = 'none';
                selectCuotas.value = 0;
            }
        };
    });

    document.getElementById('confirmar-pago').onclick = () => {
        const metodoSeleccionado = document.querySelector('input[name="pago"]:checked');
        if (!metodoSeleccionado) {
            alert('Por favor selecciona un método de pago.');
            return;
        }

        let descuento = 0;
        switch (metodoSeleccionado.value) {
            case '1':
                descuento = 0.10;
                break;
            case '2':
            case '3':
                descuento = 0;
                break;
        }

        const totalFinal = carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0) * (1 - descuento);
        const totalFinalElement = document.getElementById('total-final');
        totalFinalElement.textContent = `Total a pagar: $${totalFinal.toLocaleString()}`;

        // Lógica para las cuotas
        const cuotas = selectCuotas.value;
        let mensajesCuotas = '';

        if (cuotas > 0) {
            const cuotaMensual = (totalFinal / cuotas).toLocaleString();
            mensajesCuotas = `Total pagado: $${totalFinal.toLocaleString()} <br> ${cuotas} cuotas de $${cuotaMensual}`;
        } else {
            mensajesCuotas = `Total pagado: $${totalFinal.toLocaleString()}`;
        }

        Swal.fire({
            title: '¡Gracias por tu compra!',
            html: mensajesCuotas,
            icon: 'success',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            carrito = [];
            localStorage.removeItem('carrito');
            actualizarCarrito();
            totalFinalElement.textContent = 'Total a pagar: $0';
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