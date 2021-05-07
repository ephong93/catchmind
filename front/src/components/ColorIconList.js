import './ColorIconList.css';

function ColorIconList(props) {
    return <div
        className='color-icon-list'
    >
        {
            props.colors.map(color => 
                <div
                    key={color}
                    className='color-icon-wrapper'
                >
                    <div
                        className={`color-icon ${color} ${color === props.selectedColor && 'selected'}`}
                        onClick={() => {props.selectColor(color);}}    
                    >
                    </div>
                </div>
            )
        }
    </div>
}

export default ColorIconList;