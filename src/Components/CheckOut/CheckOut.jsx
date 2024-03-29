import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import { CartContext } from '../../Context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as Yup from 'yup';

export default function CheckOut() {
  const[isOnlinePayment , setisOnlinePayment] =useState(false)
 const {cartId,setNumOfItems} =useContext(CartContext);
 const navigate =useNavigate();
 const headers ={
  token: localStorage.getItem("userToken"),
}

const validationSchema = Yup.object({          
    details:Yup.string().min(5,"Give us More Details").required("details is Required"),
    city: Yup.string().min(3,"name is short").max(30,"name is long").required("City is required"),
    phone:Yup.string().matches(/^01[0125][0-9]{8}/,"Phone Number should start with 01 and contain 9 numbers").required("Phone Number is required"),
})
 const initialValues ={
        details: "",
        phone: "",
        city: ""
  }
 const formik =  useFormik({
    initialValues,
    validationSchema,
    onSubmit:(values) => handlePayment(values),
  })

 async function handlePayment(shippingAddress){
   try {
     const endPoint = isOnlinePayment?    
        `https://ecommerce.routemisr.com/api/v1/orders//checkout-session/${cartId}?url=http://localhost:3000`:
        `https://ecommerce.routemisr.com/api/v1/orders/${cartId}`
    
   const {data} =  await axios.post(endPoint,
      {
        shippingAddress,
      }
      ,{headers});
      console.log(data);
      if(data.status == "success"){
        toast.success("Order Placed Successfully",{theme : 'dark'})
        setNumOfItems(0);
        if(isOnlinePayment){
          setTimeout(()=> 
          window.location.href = data.session.url    
          , 5000)
          
        }
        else{
          setTimeout(()=> 
        navigate("/AllOrders") , 5000)
        }
        
      }
      else{
        toast.error("Something Went Wrong",{theme : 'dark' ,position:'bottom-right'})

      }
    
   } catch (error) {
    console.log(error);
   }
  }

  return (
    <section className='py-5'>
    <Helmet>
       <title>Check Out</title>
    </Helmet>
      <div className="container p-5 my-5">
        <h2>Checkout</h2>

        <form onSubmit={formik.handleSubmit} >

        <div className="form-group mb-3">
          <label htmlFor="phone">Phone</label>
          <input className='form-control' type="tel" id='phone' value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur} name='phone' />
          {formik.errors.phone && formik.touched.phone ? <div className='alert alert-danger my-2'> {formik.errors.phone} </div> :null}
        </div>
        
        <div className="form-group mb-3">
          <label htmlFor="city">City</label>
          <input className='form-control' type="text" id='city' name='city' value={formik.values.city} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {formik.errors.city && formik.touched.city ? <div className='alert alert-danger my-2'> {formik.errors.city} </div> :null}
        </div>

        <div className="form-group mb-3">
          <label htmlFor="details">Details</label>
          <textarea type="text" className='form-control' id='details' name='details' value={formik.values.details} onChange={formik.handleChange} onBlur={formik.handleBlur} rows="3" cols="30" ></textarea>
          {formik.errors.details && formik.touched.details ? <div className='alert alert-danger my-2'> {formik.errors.details} </div> :null}
        </div>

        <div className="d-flex align-items-center ">
        <input  type="checkbox" onChange={()=>setisOnlinePayment(!isOnlinePayment)} className='form-check-input' name="" id="payment" /> 
        <label for='payment' className="form-check-label px-1">Online Payment?</label>
        
        { isOnlinePayment? (
          <button className='btn btn-success bg-main w-50 ms-3' disabled={!(formik.isValid && formik.dirty)}>Online Payment</button>
        ) : (
          <button className='btn btn-success bg-main w-50 ms-3' disabled={!(formik.isValid && formik.dirty)}>Cash Payment</button>
        )
        }

</div>

        </form>
      </div>
    </section>
  )
}
