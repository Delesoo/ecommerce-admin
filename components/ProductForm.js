import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from 'axios';
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
    _id,
    title:existingTitle,
    description:existingDescription, 
    price:existingPrice,
    images:existingImages,
    category:assignedCategory,
    properties:assignedProperties,
}) {
    const [title,setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription || '');
    const [category, setCategory] = useState(assignedCategory || '');
    const [productProperties,setProductProperties] = useState(assignedProperties || {});
    const [price, setPrice] = useState(existingPrice || '');
    const [images, setImages] = useState (existingImages || []);
    const router = useRouter();
    const [goToProducts, setGoToProducts] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        })
    }, []);
    async function saveProduct(ev) {
        ev.preventDefault();
        const data = {title,description,price,images,category,properties:productProperties};
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
            setIsUploading(true);
            const data = new FormData();
            for (const file of files) {
                data.append('file', file);
            }
            const res = await axios.post('/api/upload', data);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            });
            setIsUploading(false);
        }
    }
    function updateImagesOrder(images) {
        setImages(images);
    }
    function setProductProp(propName,value) {
        setProductProperties(prev => {
            const newProductProps = {...prev};
            newProductProps[propName] = value;
            return newProductProps;
        });
    }
    const propertiesToFill = [];
    if (categories.length > 0 && category) {
        let catInfo = categories.find(({_id}) => _id === category);
        propertiesToFill.push(...catInfo.properties);
        while(catInfo?.parent?._id) {
            const parentCat = categories.find(({_id}) => _id === catInfo?.parent?._id);
            propertiesToFill.push(...parentCat.properties);
            catInfo = parentCat;
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
            <label>Category</label>
            <select value={category}
                    onChange={ev => setCategory(ev.target.value)}>
                <option value="">Uncategorized</option>
                {categories.length > 0 && categories.map(c => (
                    <option value={c._id}>{c.name}</option>
                ))}
            </select>
            {propertiesToFill.length > 0 && propertiesToFill.map(p => (
                <div className="flex gap-1">
                    <div>{p.name}</div>
                    <select value={productProperties[p.name]} onChange={ev => setProductProp(p.name,ev.target.value)}>
                        {p.values.map(v => (
                            <option value={v}>{v}</option>
                        ))}
                    </select>
                </div>
            ))}
            <label>
                Photos
            </label>
            <div className="mb-2 flex flex-wrap gap-1">
                <ReactSortable 
                list={images}
                className='flex flex-wrap gap-1' 
                setList={updateImagesOrder}>
                {!!images?.length && images.map(link => (
                    <div key={link} className="h-32">
                        <img src={link} alt="" className="rounded-lg"/>
                    </div>
                ))}
                </ReactSortable>
                {isUploading && (
                    <div className="h-32 flex items-center">
                        <Spinner />
                    </div>
                )}
                <label className="w-32 h-32 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
</svg>
            <div>
                Upload
            </div>
                    <input type="file" onChange={uploadImages} className="hidden"></input>
                </label>
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