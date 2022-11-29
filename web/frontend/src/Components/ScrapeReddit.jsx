import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';

function ScrapeReddit(props) {

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [scrapeResults, setScrapeResults] = useState([]);

    const textInputRef = useRef();
    const resFreqRef = useRef();

    const scrapeBtnRef = useRef();
    let previousText = useRef('TEMPLATE MESSAGE');
    function scrape(){
        const text = textInputRef.current.value;
        let freq = resFreqRef.current.value;
        if(freq == '')freq = 100;
        if(freq != '' && isNaN(freq)){
            setError('Result quantity must be a number')
            return;
        }
        if(text==previousText.current){
            setError('Type a different word/phrase');
            return;
        } else if(text==''){
            setError(`Input field can't be empty`);
            return;
        }
        previousText.current = text;
        setLoading(true);

        let xhr = new XMLHttpRequest();
        xhr.open('POST','http://localhost:8080/redditScrapping', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            text: text,
            freq: freq
        }));
        xhr.onload = ()=>{
            setLoading(false);
            const response = JSON.parse(xhr.responseText);
            if(response.error){
                setError(response.error);
            } else if(response.scrappingErr){
                setError('Uncaught error. Please retry the search')
            } else {
                // the response from python is in string format - it needs to be cleaned up and put in arrays properly

                // splits the response string into an array, but the arrays have "), " at the end
                // the temp array consists of strings, that contain both the word and the frequancy of the word
                const temp = xhr.responseText.split('(');

                // cleanerTemp consists of array of strings without the closing bracket
                const cleanerTemp = temp.map(element=>{
                    return element.slice(0,element.indexOf(')'));
                })

                // evenMoreCleanerTemp is the array, that consists of arrays that in the [0] index have the word, and at [1] have the frequancy
                const evenMoreCleanerTemp = cleanerTemp.map(element=>{
                    return element.split(', ')
                })

                // finalArray is like evenMoreCleanerTemp, but without the unnecessary paranthases in [0]
                setScrapeResults(evenMoreCleanerTemp.map(element=>{
                    const temporary = [element[0].replaceAll(`'`,''), parseFloat(element[1])]
                    return temporary;
                }))
            }
        }
    }
    
    useEffect(()=>{
        if(error!==null){
            setTimeout(() => {
                setError(null);
            }, 2000);
        }
    },[error])

    useEffect(()=>{
        if(loading==true){
            scrapeBtnRef.current.classList.add('button-disabled');
        }
        if(loading==false && scrapeBtnRef.current.classList.contains('button-disabled')){
            scrapeBtnRef.current.classList.remove('button-disabled');
        }
    },[loading])

    return (
        <div className='scrapeReddit'>
            <h4 style={{fontSize:'2rem',margin:'10px'}}>Reddit scrapping</h4>
            <p className='errorMsg'>{error}</p>
            <div className='inputs'>
                <input className='main-text-input' placeholder='Your word' ref={textInputRef}></input>
                <input className='main-text-input' placeholder='Word qty.' ref={resFreqRef}></input>
            </div> 
            <div className='input-results'>
                <ul>
                    <li>Word</li>
                    <li>Frequency</li>
                </ul>
                <div className='input-innerResults'>
                    {scrapeResults.map((singleField,index)=>{
                        if(singleField[0] == '&#X200B;')return;
                        if(isNaN(singleField[1]))return;
                        return(
                            <ul className='reddit-ul' key={index}>
                                <li>{singleField[0]}</li>
                                <li>{singleField[1]}</li>
                            </ul>
                        )
                    })}
                </div>
            </div>
            <div className='input-buttons'>
                <button onClick={()=>{scrape()}} ref={scrapeBtnRef}>{loading==true ? <div className="lds-dual-ring"></div> : <p style={{margin:'0'}}>Scrape</p>}</button>
                <button>Detailed view</button>
            </div>
            <button className='goBack-btn' onClick={()=>{props.setWhatToScrape('')}}>Go back</button>
        </div>
    );
}

export default ScrapeReddit;