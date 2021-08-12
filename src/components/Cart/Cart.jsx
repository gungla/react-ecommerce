import React, { useEffect, useState } from "react";
import { Container, Col, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Loading } from "../Loading/Loading";
import './Cart.css'
import {useCartContext} from '../../Context/CartContext'
import FormularioOrden from '../FormularioOrden/FormularioOrden'
import {getFireStore} from  '../../data/firebaseService'
import firebase from "firebase";
import 'firebase/firestore'

function Cart() {

  const { product, clearCart, deleteFromCart, precioTotal } = useCartContext();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [confirmation, setConfirmation] = useState(false)

  const handleFinalize = () =>{
    setShowForm(true)
}

const createOrder = (buyer) =>{
    const db = getFireStore()
    const orders = db.collection('order')
     
    const newOrder = {
        buyer,
        product,
        date: firebase.firestore.Timestamp.fromDate(new Date()),
        total: precioTotal()
    }
    
    orders.add(newOrder).then(({id}) => {
          setOrderId(id)
          setConfirmation(true)
      }
    ).catch((e) => {console.log(e)})

    const Itemscollection = db.collection("ItemCollection")
    const batch = getFireStore().batch()

    product.forEach( p => {
      batch.update(Itemscollection.doc(p.id),{stock:p.stock - p.quantity})
    })
    batch.commit()
    .then(()=>{
        console.log("Termino bien")
        clearCart()
    })
    .catch(err=>console.log(err))
    
}

console.log("Confirmacion",confirmation)
console.log("orderId",orderId)



  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <div>
      <Col>
        <Container>
          {loading && <Loading/>}
          <div className="card">
          {!loading && product.length !== 0 && (
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Detalle del carrito</th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>
                    <button className="btn btn-danger" onClick={clearCart}>
                      Limpiar carrito
                    </button>
                  </th>
                </tr>
              </thead>
              <thead>
                <tr>
                  <th>Borrar</th>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                </tr>
              </thead>
              {product.map((item) => (
                <tbody key={item.item.id}> 
                  <tr>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => deleteFromCart(item)}
                      >
                        X
                      </button>
                    </td>
                    <td>
                      <img
                        variant="top"
                        src={item.item.pictureURL}
                        alt={item.item.title}
                        className="imgCart"
                      />
                    </td>
                    <td>{item.item.title}</td>
                    <td>
                      {item.quantity}
                    </td>
                    <td>
                      $ {item.quantity * item.item.price}
                    </td>
                  </tr>
                </tbody>
              ))}
            </Table>
          )}

          {!loading && product.length !== 0 && (
            <div>
              <small className="text-muted aca">
                Precio Total $ {precioTotal()}
              </small>
                <h3>Su Orden No. <span className="validation">{orderId}</span> ha sido confirmada</h3>
                
                {showForm ? 
                  <FormularioOrden createOrder={createOrder}/> 
                : 
                  <button className ="boton" onClick={handleFinalize}>Finalizar compra</button>
                }
            </div>
          )}

          {!loading && product.length === 0 && (
            <div>
                <h1 className="alinear">No hay productos en el carrito</h1>
                <Link className="boton" to="/">
                  Continuar comprando
                </Link>
            </div>
          )}
          </div>
        </Container>
      </Col>
    </div>
  );
}

export default Cart;