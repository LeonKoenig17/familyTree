import { Component, Input } from '@angular/core';
import { PersonNode } from '../../treeData';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  @Input() person: PersonNode = { id: "", name: ""};
  name = "";
  ngOnInit() {
    this.name = this.person.name
      .trim()
      .split(/\s+/)
      .join("\n")
    console.log(this.name);
  }
}
