import json

cala = 1
nombre = "lol"
texto = "Esto es una prueba"
valoracion = 3
fecha = 1620812987
nComentario = {"nombre": nombre, "texto": texto, "valoracion": valoracion, "fecha": fecha}

with open("_json/comentarios.json", encoding='utf-8') as file:
    data = json.load(file)
    #print(data)

data[cala]["comentarios"].append(nComentario)
val_global = data[cala]["valoracionGlobal"]
lst = [val_global]
for i in range(len(data[cala]["comentarios"])):
    lst.append(data[cala]["comentarios"][i]["valoracion"])

data[cala]["valoracionGlobal"] = sum(lst) / len(lst)

with open("_json/comentarios.json", "w", encoding='utf-8') as file:
    json.dump(data, file, indent=4, ensure_ascii=False)