import { Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { LoadingComponent } from './loading.component';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  overlayRef: OverlayRef;
  constructor(private overlay: Overlay) { }

  open() {
    // Returns an OverlayRef which is a PortalHost
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically(),
    });

    // Create ComponentPortal that can be attached to a PortalHost
    const loadingPortal = new ComponentPortal(LoadingComponent);

    // Attach ComponentPortal to PortalHost
    this.overlayRef.attach(loadingPortal);
  }

  close(): void {
    this.overlayRef.dispose();
  }
}
