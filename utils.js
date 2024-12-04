// utils.js
const letterToNumber = {
    K: 000,
    KK: 000000,
    M: 000000,
    B: 000000000,
    T: 000000000000,
    Q: 000000000000000,
    // Continue até z, se necessário
};

function convertLetterToNumber(input) {
    if (letterToNumber[input.toLowerCase()]) {
        return letterToNumber[input.toLowerCase()];
    }
    return null; // Retorna null se não for uma letra válida
}

module.exports = { convertLetterToNumber };
