
function isValidId(id) {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
}

function sendError(res, error) {

    console.error("[SoundNest API]", error);

    if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            message: "El registro ya existe."
        });
    }

    if (
        error.code === "ER_ROW_IS_REFERENCED_2" ||
        error.code === "ER_ROW_IS_REFERENCED"
    ) {
        return res.status(409).json({
            message: "No se puede eliminar el registro porque tiene datos relacionados."
        });
    }

    if (
        error.code === "ER_NO_REFERENCED_ROW_2" ||
        error.code === "ER_NO_REFERENCED_ROW"
    ) {
        return res.status(400).json({
            message: "La referencia indicada no existe."
        });
    }

    return res.status(500).json({
        message: "Error interno del servidor."
    });
}

module.exports = { isValidId, sendError };
