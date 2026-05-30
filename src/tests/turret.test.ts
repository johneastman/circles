import { SplitterBullet } from "../sprites/circles";
import { TurretMode, BulletType, Turret } from "../sprites/turret";
import { Vector } from "../utils/vector";

describe("getBullets", () => {

    describe("Single Turret Mode", () => {
        let turret: Turret = new Turret(new Vector(0, 0));
        turret.setTurretMode(TurretMode.SINGLE);

        test("Default Bullet Type", () => {
            turret.setBulletType(BulletType.DEFAULT);

            let bullets = turret.getBullets(800, 600);
            expect(bullets.length).toBe(1);
        });

        test("Bounce Bullet Type", () => {
            turret.setBulletType(BulletType.BOUNCE);
            
            const bullets = turret.getBullets(800, 600);
            expect(bullets.length).toBe(1);
            expect(bullets[0].bounceCounter).toBe(3);
        });

        test("Burst Bullet Type", () => {
            turret.setBulletType(BulletType.BURST);
            
            const bullets = turret.getBullets(800, 600);
            expect(bullets.length).toBe(1);
            expect(bullets[0] instanceof SplitterBullet).toBe(true);
        });
    });

    describe("Array Turret Mode", () => {
        let turret: Turret = new Turret(new Vector(0, 0));
        turret.setTurretMode(TurretMode.ARRAY);

        test("Default Bullet Type", () => {
            turret.setBulletType(BulletType.DEFAULT);

            let bullets = turret.getBullets(800, 600);
            expect(bullets.length).toBe(3);
        });

        test("Bounce Bullet Type", () => {
            turret.setBulletType(BulletType.BOUNCE);
            
            const bullets = turret.getBullets(800, 600);
            expect(bullets.length).toBe(3);
            bullets.forEach((bullet) => {
                expect(bullet.bounceCounter).toBe(3);
            });
        });

        test("Burst Bullet Type", () => {
            turret.setBulletType(BulletType.BURST);
            
            const bullets = turret.getBullets(800, 600);
            expect(bullets.length).toBe(3);
            bullets.forEach((bullet) => {
                expect(bullet instanceof SplitterBullet).toBe(true);
            });
        });
    });
});
