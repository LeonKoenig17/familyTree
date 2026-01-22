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

  placeholders = [
    "/images/download.jpg",
    "/images/download (1).jpg",
    "/images/download (2).jpg",
    "/images/download (3).jpg",
    "/images/download (4).jpg",
    "/images/download (5).jpg",
    "/images/download (6).jpg",
    "/images/download (7).jpg",
    "/images/download (8).jpg",
    "/images/download (9).jpg",
    "/images/images (1).jpg",
    "/images/images (2).jpg",
    "/images/images (3).jpg",
    "/images/images (4).jpg",
    "/images/images (5).jpg",
    "/images/images (6).jpg",
    "/images/images (7).jpg",
    "/images/images (8).jpg",
    "/images/images (9).jpg",
    "/images/images (10).jpg",
    "/images/images (11).jpg",
    "/images/images (12).jpg",
    "/images/images (13).jpg",
    "/images/images (14).jpg",
  ];

  randomPlaceholder = this.placeholders[Math.floor(Math.random() * this.placeholders.length)];
}
