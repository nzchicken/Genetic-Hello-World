const RUN_ON_START = false;
const AVAILABLE_CHARACTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345789!@#$%^&*()_+`~[]{}\|;':\".,/<>?";

// individual genes
class Gene {
  constructor(code) {
    this.code = code ? code : [];
    this.cost = 9999;
  }

  generateCode(length) {
    for (var i = 0; i < length; i++) {
      this.code[i] = Math.floor(Math.random() * AVAILABLE_CHARACTERS.length);
    }
  }

  // calculate difference between current gene and other gene
  calcDiff(otherGene) {
    var val = 0;
    for (var i = 0; i < this.code.length; i++) {
      val += (this.code[i] - otherGene.code[i]) * (this.code[i] - otherGene.code[i]);
    }
    this.cost = val;
  }

  // mate current gene with another gene
  // pivot may be changed for better results
  mate(gene) {

    var pivot = Math.round(this.code.length/2) - 1;

    // new children will take half of each gene
    var newChild_1 = [ ...this.code.slice(0, pivot), ...gene.code.slice(pivot) ];
    var newChild_2 = [ ...gene.code.slice(0, pivot), ...this.code.slice(pivot) ];

    return [new Gene(newChild_1), new Gene(newChild_2)];
  }

  // randomly mutate gene by a character depending on the percentage
  mutate(percentage) {
    if (Math.random() > percentage) {
      var index = Math.floor(Math.random() * this.code.length);

      var upDown = Math.random() > 0.5 ? 1 : -1;

      var existingCode = this.code[index];

      var newCode = existingCode + upDown
            
      var fixedCode = newCode > AVAILABLE_CHARACTERS.length ? 0 : (newCode < 0 ? AVAILABLE_CHARACTERS.length : newCode); 

      this.code[index] = fixedCode;
    }
  }

  isSame(gene) {
    return this.code.every((element, index) => gene.code[index] == element);
  }

  print() {
    return this.code.map(element => AVAILABLE_CHARACTERS[element]).join("");
  }
}

class Population {
  // stores the entire gene population and finds the targetChromosome
  constructor(targetChromosome, popSize) {
    this.running = false;
    this.genePool = [];
    this.generationNumber = 0;

    this.targetChromosome = new Gene(targetChromosome.split('').map(value => AVAILABLE_CHARACTERS.indexOf(value)));

    // create genes with random codes and insert into gene pool
    for (var i = 0; i < popSize; i++) {
      var gene = new Gene();
      gene.generateCode(this.targetChromosome.code.length);
      this.genePool.push(gene);
    }
  }

  // helper function to sort gene pool by cost
  sort() {
    this.genePool.sort((a, b) => a.cost - b.cost);
  }

  // perform calculations for current generation
  generation() {

    // for all genes, calculate their cost
    for (var i = 0 ; i < this.genePool.length; i++) {
      this.genePool[i].calcDiff(this.targetChromosome);
    }

    this.sort();

    // mate the genes with the lowest cost
    var children = this.genePool[0].mate(this.genePool[1]);

    // remove the genes with the highest cost and replace them with the new children
    this.genePool.splice(this.genePool.length - 2, 2, children[0], children[1]);

    // calculate the respective difference for the children genes
    this.genePool[this.genePool.length-1].calcDiff(this.targetChromosome);
    this.genePool[this.genePool.length-2].calcDiff(this.targetChromosome);

    this.sort();
    this.print();

    for (var i = 0; i < this.genePool.length; i++) {

      // mutate and calculate difference
      this.genePool[i].mutate(0.3);
      this.genePool[i].calcDiff(this.targetChromosome);

      // check if gene is the target and display it
      if (this.genePool[i].isSame(this.targetChromosome)) {
        this.sort();
        this.print();
        this.running = false;
        return true;
      }
    }

    this.generationNumber++;

    setTimeout(() => { this.generation(); }, 20);
  }

  print() {
    var table = document.getElementById('table')
    table.innerHTML = '';
    table.innerHTML += ("<h2>Generation: " + this.generationNumber + "</h2>");
    table.innerHTML += ("<ul>");
    for (var i = 0; i < this.genePool.length; i++) {
      table.innerHTML += ("<li>" + this.genePool[i].print() + " (" + this.genePool[i].cost + ")");
    }
    table.innerHTML += ("</ul>");
  };

}

function start() {
  const pop  = new Population("Hello, world!", 20);
  pop.generation();
};


window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start").addEventListener("click", start);
    if (RUN_ON_START) start();
});
