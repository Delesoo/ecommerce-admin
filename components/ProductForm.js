import { useState } from "react";
import { useRouter } from "next/router";
import axios from 'axios';

export default function ProductForm({
    _id,
    title:existingTitle,
    description:existingDescription, 
    price:existingPrice,
    images: existingImages,
}) {
    const [title,setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription || '');
    const [price, setPrice] = useState(existingPrice || '');
    const [images, setImages] = useState (existingImages || []);
    const router = useRouter();
    const [goToProducts, setGoToProducts] = useState(false);
    async function saveProduct(ev) {
        ev.preventDefault();
        const data = {title,description,price};
        if (_id) {
        //update
        await axios.put('/api/products', {...data,_id});
        } else {
        //create
        await axios.post('/api/products', data);
        }
        setGoToProducts(true);
    }
    if (goToProducts) {
        router.push('/products');
    }
    async function uploadImages(ev) {
        const files = ev.target?.files;
        if (files?.length > 0) {
            const data = new FormData();
            for (const file of files) {
                data.append('file', file);
            }
            const res = await axios.post('/api/upload', data);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            });
        }
    }
    return (
        <form onSubmit={saveProduct}> 

            <label>Product Name</label>

            <input 
            type="text"
            placeholder="product name"
            value={title}
            onChange={ev => setTitle(ev.target.value)}/>
            <label>
                Photos
            </label>
            <div className="mb-2">
                {!!images?.length && images.map(link => (
                    <div key={link}>
                        <img src={link} alt=""/>
                    </div>
                ))}
                <label className="w-32 h-32 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
</svg>
            <div>
                Upload
            </div>
                    <input type="file" onChange={uploadImages} className="hidden"></input>
                </label>
                {!images?.length && (
                    <div>No photos in this product</div>
                )}
            </div>
            <label>Description</label>

            <textarea 
            placeholder="description" 
            value={description} 
            onChange={ev => setDescription(ev.target.value)}/>

            <label>Price (in USD)</label>
            <input
            type="number" 
            placeholder="price" 
            value={price}
            onChange={ev => setPrice(ev.target.value)}/>

            <button 
            type="submit" 
            className="btn-primary">
            Save</button>

        </form>
        
    );
}