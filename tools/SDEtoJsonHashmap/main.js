const fs = require('fs');

function getJsonDataFromFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

function main() {
    const IAM = getJsonDataFromFile('industryActivityMaterials.json');
    const IG = getJsonDataFromFile('invGroups.json');
    const IAP = getJsonDataFromFile('industryActivityProducts.json');
    const IT = getJsonDataFromFile('invTypes-nodescription.json');

    const materialsMap = new Map();
    const productsMap = new Map();

    IAM.data.forEach((iamObj) => {
        if ((iamObj.activityID == 1 || iamObj.activityID == 11) && IT[iamObj.typeID].typeName && IT[iamObj.materialTypeID] && 
            IT[iamObj.typeID].typeName && IT[iamObj.materialTypeID].typeName) {
            var blueprintName = IT[iamObj.typeID].typeName;
            var materialName = IT[iamObj.materialTypeID].typeName;
    
            var materialParams = {
                "name": materialName,
                "quantity": iamObj.quantity,
                "typeID": iamObj.materialTypeID
            }

            var materialsArray = materialsMap.get(blueprintName);
            if (materialsArray) {
                materialsArray.push(materialParams);
                materialsMap.set(blueprintName, materialsArray);
            } else {
                materialsArray = [];
                materialsArray.push(materialParams);
                materialsMap.set(blueprintName, materialsArray);
            }
        }
    });

    IAP.data.forEach((iamObj) => {
        if ((iamObj.activityID == 1 || iamObj.activityID == 11) && IT[iamObj.typeID].typeName && IT[iamObj.productTypeID] && 
            IT[iamObj.typeID].typeName && IT[iamObj.productTypeID].typeName) {
            var blueprintName = IT[iamObj.typeID].typeName;
            var materialName = IT[iamObj.productTypeID].typeName;
    
            var productParams = {
                "name": materialName,
                "quantity": iamObj.quantity,
                "typeID": iamObj.productTypeID,
                "groupID": IT[iamObj.productTypeID].groupID,
                "categoryID": IG[IT[iamObj.productTypeID].groupID].categoryID
            }

            var materialsArray = productsMap.get(blueprintName);
            if (materialsArray) {
                materialsArray.push(productParams);
                productsMap.set(blueprintName, materialsArray);
            } else {
                materialsArray = [];
                materialsArray.push(productParams);
                productsMap.set(blueprintName, materialsArray);
            }
        }
    });

    const dataToSaveMap = new Map();
    materialsMap.forEach((value, key) => {
        var activityID = key.toString().includes('Formula') ? 11 : 1;
        var obj = {
            "activityID": activityID,
            "materials": value,
            "products": productsMap.get(key)
        }
        dataToSaveMap.set(key, obj);
    });

    const dataToSave = JSON.stringify(Object.fromEntries(dataToSaveMap));
    fs.writeFileSync('blueprintReferenceMap.json', dataToSave, 'utf-8');


    const BP = getJsonDataFromFile('blueprintReferenceMap.json');
    console.log(BP['Catalyst Blueprint'].materials, BP['Catalyst Blueprint'].products);
}

main();