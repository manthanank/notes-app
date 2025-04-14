import { Component, input, Input } from '@angular/core';

@Component({
    selector: 'app-footer',
    imports: [],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {
    visitorCount = input<number>(0);
    isVisitorCountLoading = input<boolean>(false);
    visitorCountError = input<string | null>(null);
    
    currentYear = new Date().getFullYear();
}
